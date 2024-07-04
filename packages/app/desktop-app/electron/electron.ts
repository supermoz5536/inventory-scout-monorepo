// レンダラープロセスのグローバル型定義を明示的に参照します
// 一度グローバルな型定義ファイルが参照されると、
// その型定義はプロジェクト（メインプロセス）全体に適用されます。
// なので、自動的にpreload.tsでも参照が反映されます。
/// <reference path="../src/@types/global.d.ts" />

import { app, BrowserWindow, ipcMain, Menu } from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import scrapePromis from "../src/components/Scrape";

/// メインプロセスのグローバル変数です。
let appURL: string;

/// メイン画面を生成する関数です
const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 975,
    // resizable: false, // ウィンドウサイズを変更できないようにする
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

  win.loadURL(appURL);

  if (!app.isPackaged) {
    win.webContents.openDevTools();
  } else {
    win.webContents.openDevTools(); // パッケージ化された状態でもデベロッパーツールを開く
  }
};

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

/// アプリ起動時にウインドウがない場合に
/// 新しいウィンドウを生成する関数
/// (Macだと表示されないことがあるので)
app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
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
    const scrape = await scrapePromis;
    scrape.runScraping(event, asinDataList);
  } catch (error) {
    console.error("MyAPI scrape ERROR", error);
    return "MyAPI scrape ERROR"; // エラーメッセージを返す
  }
});

ipcMain.handle("save-data", (event, data) => {
  // ローカルストレージのpathを取得
  const storagePath = path.join(__dirname, "asinDataList.json");
  return new Promise<void>((resolve, reject) => {
    // fs.writeFile: node.jsのファイル書き込みメソッド
    // 構文: fs.writeFile(path, data, callback)
    // JSON形式のデータは基本的にUTF-8エンコーディングで保存されます。
    fs.writeFile(storagePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error("Failed to save data:");
        return reject(err);
      }
      console.log("Data saved successfully:", data);
      resolve();
    });
  });
});

ipcMain.handle("load-data", () => {
  const storagePath = path.join(__dirname, "asinDataList.json");
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
          return resolve([]);
        }
        // その他のエラーは、システムエラーの可能性があるため、
        // rejectして、適切に処理できるようにする
        console.error("Failed to load data:");
        return reject(err);
      }
      // JSON.parse は、
      // 無効な JSON 文字列をパースしようとしたときに
      // SyntaxError 例外をスローします。
      try {
        // ローカルに保存されている
        // Jsonファイル(jsonString)を
        // jsで扱えるように .parse で
        // JavaScriptオブジェクトに変換します。
        const parsedData = JSON.parse(data);
        console.log("Data loaded successfully");
        resolve(parsedData);
      } catch (error) {
        console.error("Failed to parse data:");
        reject(error);
      }
    });
  });
});

//====================================================================

/// 初期化処理として
/// 設定画面をコールするメニュー部分を生成する関数です。
app.whenReady().then(() => {
  // createWindow();

  const isMac = process.platform === "darwin"; // macOSかどうかを判定

  const template = [
    // 三項演算子で記述
    // macOSの場合、メニューオブジェクトを記述
    // macOSでない場合、空のの配列
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              // macOS用のPreferences
              { label: "Preferences", click: openPreferences },
            ],
          },
        ]
      : []),

    // windowsの場合、ファイルメニュー
    // windowsの場合、空の配列
    ...(!isMac
      ? [
          {
            label: "ファイル",
            submenu: [
              // Windows用のPreferences
              { label: "Preferences", click: openPreferences },
            ],
          },
        ]
      : []),
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

// Preferencesがクリックされた際の
// 設定画面を生成する関数です
function openPreferences() {
  const prefWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // ローカルファイルを指定するパスを指定したいだけなので
  // クライアント側でのみ解釈されるハッシュ部分 (#)を記述します
  prefWindow.loadURL(`${appURL}#/Setting`);
}
