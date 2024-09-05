// レンダラープロセスのグローバル型定義を明示的に参照します
// 一度グローバルな型定義ファイルが参照されると、
// その型定義はプロジェクト（メインプロセス）全体に適用されます。
// なので、自動的にpreload.tsでも参照が反映されます。
/// <reference path="../src/@types/global.d.ts" />

import { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem } from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import scrapePromis from "../src/components/Scrape";
import { persistor } from "../src/redux/store";
import cron from "node-cron";
import { Parser } from "@json2csv/plainjs";

/// メインプロセスのグローバル変数です。
let appURL: string;
let scrape: any;
let browser: any;
let scheduledTask: any;
let backGroundWindow: any;
let mainWindow: any;
let prefWindow: any;
let loginPromptWindow: any;
let StockDetailWindow: any;
let isInitSystemStatus: boolean = false;
let isInitLogoutDone: boolean = false;
let isInitLoginDone: boolean = false;
let isInitScraping: boolean = false;
let isInitScheduledTime: boolean = false;

/// アプリ起動時にウインドウがない場合に
/// 新しいウィンドウを生成する関数
/// (Macだと表示されないことがあるので)
app.whenReady().then(() => {
  createMainWindow();
  // "activate" はmacの場合のケースで
  // ウインドウはないが、Docでアプリは起動し続けてる場合に
  // アイコンをクリックすると、再びアプリがactivate状態になる
  // この時にウインドウ数が０なので、メインウインドウを生成する
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length <= 1) createMainWindow();
  });
});

app.whenReady().then(() => {
  openBackGroundWindow();
});

/// 初期化処理として
/// メニュー部分を生成する関数です。
app.whenReady().then(() => {
  const menu = new Menu();

  // darwin はmacOXの意味
  const isMac = process.platform === "darwin";
  // メニューバーのアプリ変更はパッケージ化するまで反映されません
  app.setName("在庫スカウター（ベータ版）");

  // ■ macOS用のカスタムメニューアイテムを作成
  if (isMac) {
    const appMenu = new MenuItem({
      label: app.name,
      submenu: [
        { label: "環境設定", click: openPreferences },
        { type: "separator" },
        { label: "終了", role: "quit" },
      ],
    });

    // macOSの場合は、メニューバーの２番目の項目に
    // 自動で「音声入力を開始」と「絵文字と記号」が
    // 追加されるので、ダミーデータを渡し非表示設定
    const dummyMenu = new MenuItem({
      label: "DummyData",
      visible: false,
    });

    const fileMenu = new MenuItem({
      label: "ファイル",
      submenu: [
        {
          label: "読み込み",
          submenu: [{ label: "移行データ...", click: loadTransferData }],
        },
        {
          label: "書き出し",
          submenu: [
            { label: "CSV...", click: saveDataWithCSV },
            { label: "移行データ...", click: saveTransferData },
          ],
        },
      ],
    });

    const editMenu = new MenuItem({
      label: "編集",
      submenu: [
        { label: "切り取り", role: "cut" },
        { label: "コピー", role: "copy" },
        { label: "ペースト", role: "paste" },
        { type: "separator" },
        { label: "取り消し", role: "undo" },
        { label: "すべて選択", role: "selectAll" },
      ],
    });

    menu.append(appMenu);
    menu.append(dummyMenu);
    menu.append(fileMenu);
    menu.append(editMenu);
  } else {
    // ■ Windows用のカスタムメニューアイテムを作成
    const appMenu = new MenuItem({
      label: app.name,
      submenu: [
        { label: "環境設定", click: openPreferences },
        { type: "separator" },
        { label: "終了", role: "quit" },
      ],
    });

    const fileMenu = new MenuItem({
      label: "ファイル",
      submenu: [
        {
          label: "読み込み",
          submenu: [{ label: "移行データ...", click: loadTransferData }],
        },
        {
          label: "書き出し",
          submenu: [
            { label: "CSV...", click: saveDataWithCSV },
            { label: "移行データ...", click: saveTransferData },
          ],
        },
      ],
    });

    const editMenu = new MenuItem({
      label: "編集",
      submenu: [
        { label: "切り取り", role: "cut" },
        { label: "コピー", role: "copy" },
        { label: "ペースト", role: "paste" },
        { type: "separator" },
        { label: "取り消し", role: "undo" },
        { label: "すべて選択", role: "selectAll" },
      ],
    });

    menu.append(appMenu);
    menu.append(fileMenu);
    menu.append(editMenu);
  }

  // デフォルトのメニューを削除
  Menu.setApplicationMenu(null);
  // const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

//====================================================================

// app.on メソッドは、
// Electronのライフサイクルに関連するイベントリスナーを
// 設定するために使用されます。
// これにより、アプリケーションが特定のイベント
// （例：起動、終了、ウィンドウが閉じられたときなど）
// に対して特定のアクションを実行することができます。

// macOS以外のプラットフォームでは
// 窓を全部閉じたら、アプリケーションも終了させる関数です
app.on("window-all-closed", () => {
  // window-all-closedは、
  // Electronのappオブジェクトのイベントの1つ。
  // darwin は macOSのこと
  if (process.platform !== "darwin") app.quit();
});

// アプリケーション終了前に状態を保存する
app.on("before-quit", async (event) => {
  event.preventDefault(); // プロセスの終了を防ぐ
  await persistor.flush();
  console.log("State has been flushed to persistent storage before app quit");
  app.exit(); // フラッシュ完了後にアプリケーションを終了
});

//====================================================================

// ipcMain.handle メソッドは、メインプロセスで
// 特定のIPC (Inter-Process Communication) チャンネルを設定し、
// そのチャンネルに対する非同期のリクエストを
// ハンドルするために使用されます。
// これにより、レンダラープロセスからメインプロセスに対して
// 非同期でメッセージを送信し、応答を受け取ることができます。
ipcMain.handle("runScraping", async (event, asinDataList: AsinData[]) => {
  try {
    scrape = await scrapePromis;
    browser = await scrape.launchBrowser();
    scrape.runScraping(
      scrape,
      browser,
      updateGlobalBrowser,
      backGroundWindow,
      asinDataList,
    );
  } catch (error) {
    console.error("runScraping ERROR", error);
    return "runScraping ERROR"; // エラーメッセージを返す
  }
});

ipcMain.handle("stopScraping", async () => {
  try {
    console.log("Received stopScraping request");
    if (browser) {
      await browser.close();
      browser = null;
    } else {
      console.log("No scraping process is running.");
    }
  } catch (error) {
    console.error("stopScraping ERROR", error);
    return "stopScraping ERROR"; // エラーメッセージを返す
  }
});

/// 定時スクレイピングの実行関数
ipcMain.handle("schedule-scraping", async (event, time: string) => {
  // 既に予約が入っている場合は
  // それをキャンセル(stop)して再設定します。
  if (scheduledTask) scheduledTask.stop();
  const [hour, minute] = time.split(":");
  const cronTime = `${minute} ${hour} * * *`;
  const data = await loadJsonData();
  const loadedAsinDataList = await parseJsonToJS(data);
  // runScrapingの処理対象とするため
  // 全てのitemのisScrapingをtrueに更新
  loadedAsinDataList.forEach((item) => (item.isScraping = true));
  // runScarapingの予約処理を実行
  // ブラウザが存在してる(手動トリガーでのスクレイピング宇宙)場合は
  // 予約のコールバックを実行しない
  scheduledTask = cron.schedule(cronTime, async () => {
    try {
      if (!browser) {
        // メインウインドウが開かれてない場合
        if (mainWindow === null) {
          createMainWindow();
          // ウィンドウが完全にロードされるのを待つ
          await new Promise<void>((resolve) => {
            if (mainWindow.webContents.isLoading()) {
              mainWindow.webContents.once("did-finish-load", resolve);
            } else {
              resolve();
            }
          });
        }
        // ロードされたら状態変数更新の通知をバックグランドウインドウに送り
        // メインウインドウで更新処理を行う
        backGroundWindow.webContents.send("start-scheduled-scraping");
        scrape = await scrapePromis;
        browser = await scrape.launchBrowser();
        await scrape.runScraping(
          scrape,
          browser,
          updateGlobalBrowser,
          backGroundWindow,
          loadedAsinDataList,
        );
      }
    } catch (error) {
      console.error("schedule-scraping ERROR", error);
      return "schedule-scraping ERROR"; // エラーメッセージを返す
    }
  });

  return "Scraping scheduled";
});

ipcMain.handle("stop-scheduled-scraping", (event, data) => {
  if (scheduledTask) scheduledTask.stop();
});

ipcMain.handle("save-data", (event, data) => {
  saveDataToStorage(data);
});

ipcMain.handle("load-data", async () => {
  const data = await loadJsonData();
  const parsedData = await parseJsonToJS(data);
  return parsedData;
});

ipcMain.handle("open-login-prompt", () => {
  openLoginPrompt();
});

ipcMain.handle("open-stock-detail", (event, asinData: AsinData) => {
  console.log("open-stock-detail の asinData =", asinData);
  openStockDetail(asinData);
});

// レンダラープロセスに appURL を送信
ipcMain.handle("get-app-url", () => appURL);

//====================================================================

// バックグラウンドウインドウを生成する関数です
function openBackGroundWindow() {
  backGroundWindow = new BrowserWindow({
    // width: 0,
    // height: 0,
    show: false,
    focusable: false, // ユーザーが誤って操作することを防ぐ
    resizable: false, // ウィンドウサイズを変更できないようにする
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // sandbox: trueにするとmainとrendererプロセス間の隔離が強化されて
      // preload.tsの読み込みに失敗します。
      sandbox: false,
    },
  });

  // ローカルファイルを指定するパスを指定したいだけなので
  // クライアント側でのみ解釈されるハッシュ部分 (#)を記述します
  backGroundWindow.loadURL(`${appURL}#/BackGroundWindow`);

  if (!app.isPackaged) {
    backGroundWindow.webContents.openDevTools();
  } else {
    // パッケージ化された状態でもデベロッパーツールを開く
    backGroundWindow.webContents.openDevTools();
  }
}

/// メイン画面を生成する関数です
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1650,
    height: 1050,
    resizable: false, // ウィンドウサイズを変更できないようにする
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // sandbox: trueにするとmainとrendererプロセス間の隔離が強化されて
      // preload.tsの読み込みに失敗します。
      sandbox: false,
    },
  });

  // アプリケーションがパッケージ化された状態かどうかを判別します
  appURL = app.isPackaged
    ? // パッケージ化されてる場合
      // url.format() を使用して、
      // ローカルファイルシステム上に配置された
      // build/index.html へのURLを生成します。
      url.format({
        // pathname には、
        // app.getAppPath() で取得したアプリケーションのパスと、
        // build/index.html が結合されます。
        pathname: path.resolve(app.getAppPath(), "build/index.html"),
        // protocol: 'file:' と slashes: true は、
        // ローカルファイルシステムの URL であることを示します。
        protocol: "file:",
        slashes: true,
      })
    : // パッケージ化されていない場合、
      // 開発用ローカルサーバー (localhost:3000) に
      // アクセスするための URL を生成します。
      "http://localhost:3000";

  mainWindow.loadURL(appURL);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.openDevTools(); // パッケージ化された状態でもデベロッパーツールを開く
  }

  // 該当のウインドウに対して
  // onメソッドでリスナーを設置する
  // 閉じた時(closed)にトリガーされる
  // 変数をクリアし 新規ウインドウ作成可能な状態に戻す
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Preferencesがクリックされた際の
// 設定画面を生成する関数です
function openPreferences() {
  if (prefWindow) {
    prefWindow.focus();
    return;
  }

  prefWindow = new BrowserWindow({
    width: 500,
    height: 900,
    resizable: false, // ウィンドウサイズを変更できないようにする
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // sandbox: trueにするとmainとrendererプロセス間の隔離が強化されて
      // preload.tsの読み込みに失敗します。
      sandbox: false,
    },
  });

  // ローカルファイルを指定するパスを指定したいだけなので
  // クライアント側でのみ解釈されるハッシュ部分 (#)を記述します
  prefWindow.loadURL(`${appURL}#/Setting`);

  if (!app.isPackaged) {
    prefWindow.webContents.openDevTools();
  } else {
    // パッケージ化された状態でもデベロッパーツールを開く
    prefWindow.webContents.openDevTools();
  }

  // 該当のウインドウに対して
  // onメソッドでリスナーを設置する
  // 閉じた時(closed)にトリガーされる
  // 変数をクリアし 新規ウインドウ作成可能な状態に戻す
  prefWindow.on("closed", async () => {
    prefWindow = null;
  });
}

//「取得開始」がクリックされた際の
// 設定画面を生成する関数です
function openLoginPrompt() {
  if (loginPromptWindow) {
    loginPromptWindow.focus();
    return;
  }

  loginPromptWindow = new BrowserWindow({
    width: 450,
    height: 300,
    resizable: false, // ウィンドウサイズを変更できないようにする
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // sandbox: trueにするとmainとrendererプロセス間の隔離が強化されて
      // preload.tsの読み込みに失敗します。
      sandbox: false,
    },
  });

  // ローカルファイルを指定するパスを指定したいだけなので
  // クライアント側でのみ解釈されるハッシュ部分 (#)を記述します
  loginPromptWindow.loadURL(`${appURL}#/LoginPrompt`);

  if (!app.isPackaged) {
    loginPromptWindow.webContents.openDevTools();
  } else {
    // パッケージ化された状態でもデベロッパーツールを開く
    loginPromptWindow.webContents.openDevTools();
  }

  // 該当のウインドウに対して
  // onメソッドでリスナーを設置する
  // 閉じた時(closed)にトリガーされる
  // 変数をクリアし 新規ウインドウ作成可能な状態に戻す
  loginPromptWindow.on("closed", () => {
    loginPromptWindow = null;
  });
}

//「在庫詳細」がクリックされた際の
// 詳細画面を生成する関数です
function openStockDetail(asinData: AsinData) {
  if (StockDetailWindow) {
    StockDetailWindow.focus();
    return;
  }
  StockDetailWindow = new BrowserWindow({
    width: 1225,
    height: 925,
    resizable: true, // ウィンドウサイズを変更できないようにする
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // sandbox: trueにするとmainとrendererプロセス間の隔離が強化されて
      // preload.tsの読み込みに失敗します。
      sandbox: false,
    },
  });
  // ローカルファイルを指定するパスを指定したいだけなので
  // クライアント側でのみ解釈されるハッシュ部分 (#)を記述します
  StockDetailWindow.loadURL(`${appURL}#/StockDetail`);

  StockDetailWindow.webContents.once("did-finish-load", () => {
    StockDetailWindow.webContents.send("receive-asin-data", asinData);
  });

  if (!app.isPackaged) {
    StockDetailWindow.webContents.openDevTools();
  } else {
    // パッケージ化された状態でもデベロッパーツールを開く
    StockDetailWindow.webContents.openDevTools();
  }

  // 該当のウインドウに対して
  // onメソッドでリスナーを設置する
  // 閉じた時(closed)にトリガーされる
  // 変数をクリアし 新規ウインドウ作成可能な状態に戻す
  StockDetailWindow.on("closed", () => {
    StockDetailWindow = null;
  });
}

// メインプロセス内で通常利用できる関数
function updateGlobalBrowser(newBrowser: any) {
  browser = newBrowser;
}

// ローカルストレージからJsonデータを取得する関数
function loadJsonData(): Promise<string> {
  const storagePath = path.join(app.getPath("appData"), "asinDataList.json");
  return new Promise((resolve, reject) => {
    // fs.readFile メソッドで "utf8" を指定すると
    // ファイルの内容をUTF-8エンコーディングとして読み取ります。
    // fs.readFile のコールバック関数の引数 (err, data) は、
    // ファイル読み取り操作が完了したときに
    // fs.readFile 関数によって自動的に提供されます。
    fs.readFile(storagePath, "utf8", (err, data) => {
      if (err) {
        // エラーが発生した場合、
        // 特にファイルが存在しない場合
        // "Error NO ENTry" の略で、
        // 指定されたファイルや
        // ディレクトリが存在しない場合のエラー
        if (err.code === "ENOENT") {
          // ENOENTは、ファイルが存在しないことを示すエラー
          // ファイルがまだ作成されていない場合に発生するため、
          // 重大なエラーではないとみなし、
          // 空の配列を返して通常の処理を続行する
          console.warn("No data file found, returning empty array");
          return resolve("");
        }
        // その他のエラーは、システムエラーの可能性があるため、
        // rejectして、適切に処理できるようにする
        console.error("Failed to load data:");
        return reject(err);
      }
      resolve(data);
    });
  });
}

/// loadJsonData()で取得したJsonデータを
/// JSのオブジェクトに変換する関数
function parseJsonToJS(jsonData: string) {
  try {
    const parsedData = JSON.parse(jsonData);
    console.log("parseJsonToJS successfully");
    return parsedData;
  } catch (error) {
    console.error("Failed to parseJsonToJS", error);
    return [];
  }
}

/// loadJsonData()で取得したJsonデータを
/// CSVに変換する関数
function parseJavaScriptToCSV(javaScriptData: any) {
  try {
    // asinDataListのネストされた全ての要素を
    // csvの見出し列に追加できるように並列化処理
    const expandedData = javaScriptData.flatMap((item: any) => {
      const { fbaSellerDatas, ...rest } = item;
      return fbaSellerDatas.flatMap((sellerData: any) => {
        return sellerData.stockCountDatas.map((stock: any) => {
          const [date, count] = Object.entries(stock)[0];
          return {
            ...rest,
            sellerId: sellerData.sellerId,
            sellerName: sellerData.sellerName,
            date,
            count,
          };
        });
      });
    });

    // csvの各見出し列名を日本語に変換
    const opts = {
      fields: [
        { label: "ASIN", value: "asin" },
        { label: "画像URL", value: "imageURL" },
        { label: "名前", value: "name" },
        { label: "Amazon在庫", value: "amazonStock" },
        { label: "FBA出品者数", value: "fbaSellerNOP" },
        { label: "総在庫数", value: "totalStock" },
        { label: "カート価格", value: "cartPrice" },
        { label: "減少1", value: "decrease1" },
        { label: "減少2", value: "decrease2" },
        { label: "親ASIN", value: "asinParent" },
        { label: "出品者ID", value: "sellerId" },
        { label: "出品者名", value: "sellerName" },
        { label: "日付", value: "date" },
        { label: "在庫数", value: "count" },
      ],
    };
    const parser = new Parser(opts);
    const csvData = parser.parse(expandedData);
    console.log("parseJsonToCSV successfully");
    return csvData;
  } catch (error) {
    console.error("Failed to parseJsonToCSV", error);
    return [];
  }
}

// ローカルストレージのjsonを
// csv形式で出力する関数
// 「メニュー → ファイル → 書き出し → CSV」
async function saveDataWithCSV() {
  const jsonData: string = await loadJsonData();
  const javaScriptData = await parseJsonToJS(jsonData);
  const csvData = parseJavaScriptToCSV(javaScriptData);

  // dialogクラスのshowSaveDialogメソッドでの返り値のオブジェクトには
  // canceled, filePathのプロパティがあり、
  // そのプロパティ名で各プロパティの値を格納した変数を宣言
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "CSVファイルを保存",
    // path : node.jsの標準モジュール
    // app : electronの標準モジュール
    defaultPath: path.join(app.getPath("desktop"), "data.csv"),
    filters: [
      // name: このフィルタの表示名
      // extensions: 許可されるファイル拡張子のリスト。
      // *は任意の拡張子を意味し、すべてのファイルが許可されます。
      { name: "CSV Files", extensions: ["csv"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  try {
    if (!canceled && filePath) {
      await fs.promises.writeFile(filePath, csvData);
      console.log("CSVファイルが保存されました");
    } else {
      console.log("ユーザーが保存をキャンセルしました");
    }
  } catch (error) {
    console.error("CSVファイルの保存に失敗しました:", error);
  }
}

// ローカルストレージのJsonを
// アップグレード用の移行データとして
// そのまま出力する関数
async function saveTransferData() {
  const jsonData: string = await loadJsonData();

  // dialogクラスのshowSaveDialogメソッドでの返り値のオブジェクトには
  // canceled, filePathのプロパティがあり、
  // そのプロパティ名で各プロパティの値を格納した変数を宣言
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "CSVファイルを保存",
    // path : node.jsの標準モジュール
    // app : electronの標準モジュール
    defaultPath: path.join(app.getPath("desktop"), "data.json"),
    filters: [
      // name: このフィルタの表示名
      // extensions: 許可されるファイル拡張子のリスト。
      // *は任意の拡張子を意味し、すべてのファイルが許可されます。
      { name: "Json Files", extensions: ["json"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  try {
    if (!canceled && filePath) {
      await fs.promises.writeFile(filePath, jsonData);
      console.log("移行データが保存されました");
    } else {
      console.log("ユーザーが保存をキャンセルしました");
    }
  } catch (error) {
    console.error("移行データの保存に失敗しました:", error);
  }
}

// ローカルストレージのJsonを
// アップグレード用の移行データを読み込む関数
async function loadTransferData() {
  // ipcMain.handle("load-transfer-data", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "移行データの読み込み",
    properties: ["openFile"],
    filters: [
      // name: このフィルタの表示名
      // extensions: 許可されるファイル拡張子のリスト。
      // *は任意の拡張子を意味し、すべてのファイルが許可されます。
      { name: "CSV Files", extensions: ["json"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  try {
    if (!canceled && filePaths.length > 0) {
      const loadedTransferData = await fs.promises.readFile(
        filePaths[0],
        "utf8",
      );
      const parsedData = parseJsonToJS(loadedTransferData);
      console.log("移行データを読み込みました");

      // ローカルストレージへの保存
      saveDataToStorage(parsedData);

      // レンダラープロセスにデータを送信
      backGroundWindow.webContents.send("load-transfer-data", parsedData);

      return parsedData;
    } else {
      console.log("移行データの読み込みをユーザーがキャンセルしました");
    }
  } catch (error) {
    console.error("移行データの読み込みに失敗しました:", error);
  }
}

function saveDataToStorage(data: any) {
  // ローカルストレージのpathを取得
  const storagePath = path.join(app.getPath("appData"), "asinDataList.json");
  return new Promise<void>((resolve, reject) => {
    // fs.writeFile: node.jsのファイル書き込みメソッド
    // 構文: fs.writeFile(path, data, callback)
    // JSON形式のデータは基本的にUTF-8エンコーディングで保存されます。
    // stringify 第二引数は「リプレーサー」と呼ばれ、
    // どのプロパティをJSONに含めるかを決めるためのものです。
    // null を指定すると、そのオブジェクトのすべてのプロパティがJSON文字列に含まれます。
    // stringify 第3引数: JSON文字列を整形（インデント）するために使用されるスペース数
    fs.writeFile(storagePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error("Failed to save data:");
        return reject(err);
      }
      console.log("Data saved successfully:", data);
      resolve();
    });
  });
}
