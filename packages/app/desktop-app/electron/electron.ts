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
import express from "express";
import { Server } from "http";
import ps_tree from "ps-tree";
import { exec, spawn } from "child_process";
import treeKill from "tree-kill";
import sudo from "sudo-prompt";
var options = {
  name: "Zaiko Z",
};
/// メインプロセスのグローバル変数です。
let appURL: string;
let appURLForStripe: string;
let scrape: any;
let browser: any;
let scheduledTask: any;
let backGroundWindow: any;
let mainWindow: any;
let prefWindow: any;
let loginPromptWindow: any;
let StockDetailWindow: any;
let assignedPort: string;
let httpServerObj: Server;
let isQuitting = false;
// const gotTheLock = app.requestSingleInstanceLock();
// const logFilePathWin = path.join("C:\\temp", "log.txt");
const logFilePathWin = path.join(
  "C:\\Users\\windows\\Desktop\\temp",
  "log.txt",
);
const logFilePathMac = path.join("/Users/administrator", "log.txt");

// ログをファイルに書き込む関数
const logToFileWin = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePathWin, logMessage, { encoding: "utf8" });
};
// ログをファイルに書き込む関数
const logToFileMac = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePathMac, logMessage, { encoding: "utf8" });
};

// // ■■■■ taskKill関数を定義
// const psTreePromise = (parentPid) => {
//   return new Promise<void>((resolve, reject) => {
//     ps_tree(parentPid, (err, children) => {
//       if (err) {
//         reject(err);
//       } else {
//         // 子プロセスをすべてkillする
//         if (children && children.length > 0) {
//           children.forEach((child) => {
//             try {
//               process.kill(Number(child.PID), "SIGKILL");
//               console.log(`Process ${child.PID} has been killed.`);
//             } catch (e) {
//               console.log(`Failed to kill childprocess ${child.PID}`, e);
//             }
//           });
//         }
//         resolve();
//       }
//     });
//   });
// };

// // ■■■■ taskKillPromise関数を定義
// const taskKillPromiseWithAppName = (processName: String) => {
//   return new Promise<void>((resolve, reject) => {
//     // Windows の taskkill コマンドで
//     // 親プロセスと子プロセスを強制終了

//     // 実行するWindowsコマンドを文字列として格納する定数を宣言
//     // /T は「ツリー状に終了する」という意味。派生したプロセスも含めて終了
//     // /IM はプロセス名を指定
//     // /F は強制終了
//     const command = `taskkill /F /IM ${processName} /T`;

//     // // デスクトップにログファイルを作成
//     // const logFilePath = path.join("C:\\temp", "taskkill_log.txt");

//     exec(command, (error, stdout, stderr) => {
//       // error: コマンドの実行自体が失敗した場合
//       // stdout: Standard Output(コマンドやプログラムが失敗した場合)
//       // stderr: Standard Error(コマンドやプログラムが失敗した場合)
//       if (error) {
//         // // エラーが発生した場合、そのメッセージをログファイルに書き込む
//         // // ファイルに追記（ファイルがなければ作成）
//         // const errorMessage = `taskkill failed: ${error.message}\nstderr: ${stderr}\n`;
//         // fs.appendFileSync(logFilePath, errorMessage);
//         console.error(`taskkill failed: ${error.message}`);
//         reject(error);
//       } else {
//         // // 成功した場合もログに成功のメッセージを記録
//         // // ファイルに追記（ファイルがなければ作成）
//         // const successMessage = `taskkill successful: ${stdout}\n`;
//         // fs.appendFileSync(logFilePath, successMessage);
//         console.log(`taskkill successful: ${stdout}`);
//         resolve();
//       }
//     });
//   });
// };

// // ■■■■ taskKillPromise関数を定義
// const taskKillPromiseWithExec = (parentPid: number) => {
//   return new Promise<void>((resolve, reject) => {
//     // Windows の taskkill コマンドで
//     // 親プロセスと子プロセスを強制終了

//     // 実行するWindowsコマンドを文字列として格納する定数を宣言
//     // /T は「ツリー状に終了する」という意味。派生したプロセスも含めて終了
//     // /IM はプロセス名を指定
//     // /F は強制終了
//     const command = `taskkill /PID ${parentPid} /T /F`;

//     // デスクトップにログファイルを作成
//     logToFileWin("test log");

//     exec(command, (error, stdout, stderr) => {
//       // error: コマンドの実行自体が失敗した場合
//       // stdout: Standard Output(コマンドやプログラムが失敗した場合)
//       // stderr: Standard Error(コマンドやプログラムが失敗した場合)
//       if (error) {
//         // // エラーが発生した場合、そのメッセージをログファイルに書き込む
//         // // ファイルに追記（ファイルがなければ作成）
//         // const errorMessage = `taskkill failed: ${error.message}\nstderr: ${stderr}\n`;
//         // fs.appendFileSync(logFilePath, errorMessage);
//         console.error(`taskkill failed: ${error.message}`);
//         reject(error);
//       } else {
//         // // 成功した場合もログに成功のメッセージを記録
//         // // ファイルに追記（ファイルがなければ作成）
//         // const successMessage = `taskkill successful: ${stdout}\n`;
//         // fs.appendFileSync(logFilePath, successMessage);
//         console.log(`taskkill successful: ${stdout}`);
//         resolve();
//       }
//     });
//   });
// };

// ■■■■
const taskKillPromiseWithSudo = (parentPid: number) => {
  return new Promise<void>((resolve, reject) => {
    const taskKillPath = "C:\\Windows\\System32\\taskkill.exe"; // フルパスを指定
    const command = ` ${taskKillPath} /PID ${parentPid} /T /F`;
    console.log("test 2.1");

    sudo.exec(command, options, function (error, stdout, stderr) {
      console.log("test 2.2");
      if (error) {
        console.log("test 2.3");
        console.error(`taskkill failed: ${error.message}`);
        reject(error);
      } else {
        console.log("test 2.4 taskkill success");
        resolve();
      }
    });
  });
};

// ■■■■
// const killParentWithSpawn = (parentPid: number) => {
//   return new Promise<void>(async (resolve, reject) => {
//     // PIDでプロセスリストを取得
//     const list = await require("find-process")("pid", parentPid);
//     // if (list[0] && list[0].pid === parentPid) {
//     //   try {
//     //     process.kill(parentPid);
//     //     logToFileWin(`Parent process ${parentPid} killed successfully.`);
//     //     resolve();
//     //   } catch (e) {
//     //     console.log("killParentWithSpawn process.kill failed", e);
//     //     logToFileWin(`Failed to get child processes: ${e}`);
//     //     reject();
//     //   }
//     // } else {
//     //   logToFileWin(`Parent process ${parentPid} not found.`);
//     //   resolve();
//     // }

//     // spawnを使って親プロセスをkillする
//     const command = "taskkill";
//     const args = ["/PID", `${parentPid}`, "/F"];

//     // killを実行
//     try {
//       const killProcess = spawn(command, args);

//       // 標準出力をキャプチャ
//       killProcess.stdout.on("data", (data) => {
//         console.log(`spawn stdout: ${data}`);
//       });

//       // エラー出力をキャプチャ
//       killProcess.stderr.on("data", (data) => {
//         console.error(`spawn stderr: ${data}`);
//       });

//       // プロセスが終了したときの処理
//       killProcess.on("close", (code) => {
//         if (code === 0) {
//           resolve();
//         } else {
//           console.error(`Failed to kill process ${parentPid}, code: ${code}`);
//           reject(
//             new Error(`Failed to kill process ${parentPid}, code: ${code}`),
//           );
//         }
//       });

//       // エラーハンドリング
//       killProcess.on("error", (error) => {
//         console.error(`Failed to spawn process: ${error.message}`);
//         reject(error);
//       });
//     } catch (e) {
//       console.log("killProcess process.kill failed", e);
//     }
//   });
// };

// ■■■■
// const killChildrenWithSpawn = (parentPid: number) => {
//   return new Promise<void>((resolve, reject) => {
//     ps_tree(parentPid, (err, children) => {
//       if (err) {
//         reject(err);
//       } else if (children && children.length > 0) {
//         // 子プロセスをすべてkillする
//         const killPromises = children.map((child) => {
//           return new Promise<void>((resolveChild, rejectChild) => {
//             try {
//               // killを実行
//               const killProcess = spawn("taskkill", [
//                 "/PID",
//                 `${child.PID}`,
//                 "/F",
//               ]);

//               // プロセスが正常に終了したときの処理
//               killProcess.on("close", (code) => {
//                 if (code === 0) {
//                   resolveChild();
//                 } else {
//                   console.error(
//                     `Failed to kill process ${parentPid}, code: ${code}`,
//                   );
//                   rejectChild(
//                     new Error(
//                       `Failed to kill process ${parentPid}, code: ${code}`,
//                     ),
//                   );
//                 }
//               });

//               // エラーハンドリング
//               killProcess.on("error", (error) => {
//                 console.error(`Failed to spawn process: ${error.message}`);
//                 rejectChild(error);
//               });
//               console.log(`Process ${child.PID} has been killed.`);
//             } catch (e) {
//               console.log(`Failed to kill childprocess ${child.PID}`, e);
//               rejectChild(e);
//             }
//           });
//         });
//         Promise.all(killPromises)
//           .then(() => resolve())
//           .catch((error) => {
//             reject(error);
//           });
//       } else {
//         // childrenが存在しない、もしくは、配列が空の場合
//         // killする必要のあるプロセスがないので解決させる
//         resolve();
//       }
//     });
//   });
// };

// // ■■■■ 指定されたPIDの親プロセスと子プロセスを終了する関数
// const killParentWithTreeKill = async (parentPid: number) => {
//   return new Promise<void>((resolve, reject) => {
//     treeKill(parentPid, "SIGKILL", (err) => {
//       if (err) {
//         console.error(`プロセス ${parentPid} の終了に失敗しました:`, err);
//         reject(err);
//       } else {
//         console.log(
//           `プロセス ${parentPid} とその子プロセスが正常に終了しました`,
//         );
//         resolve();
//       }
//     });
//   });
// };

const killServerPromise = () => {
  return new Promise<void>((resolve) => {
    httpServerObj.close(() => {
      console.log("Server has been closed");
      resolve();
    });
  });
};

// // 2回目のアプリ本体のインスタンス化
// if (!gotTheLock) {
//   app.quit(); // すでにアプリが起動している場合、新しいインスタンスを終了

//   // 1回目のアプリ本体のインスタンス化
// } else {
//   app.on("second-instance", (event, argv, workingDirectory) => {
//     // ここで、ウィンドウが存在する場合は、フォーカスを当てる
//     if (mainWindow) {
//       if (mainWindow.isMinimized()) mainWindow.restore();
//       mainWindow.focus();
//     }
//   });
// }

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
app.on("window-all-closed", async () => {
  // window-all-closedは、
  // Electronのappオブジェクトのイベントの1つ。

  if (process.platform !== "darwin") app.quit();
});

// アプリケーション終了前に状態を保存する
app.on("before-quit", async (event) => {
  if (isQuitting) return;
  isQuitting = true;

  event.preventDefault();

  BrowserWindow.getAllWindows().forEach((window) => {
    if (window && !window.isDestroyed()) window.destroy();
  });

  if (app.hasSingleInstanceLock()) app.releaseSingleInstanceLock();
  if (scheduledTask) scheduledTask.stop();
  if (httpServerObj) await killServerPromise();

  console.log("test 1");
  try {
    await persistor.flush();
  } catch (e) {
    console.error("Failed to flush state:", e);
  }
  console.log("test 2");

  try {
    await taskKillPromiseWithSudo(process.pid);
  } catch (e) {
    console.error("Failed to taskKillPromiseWithSudo:", e);
  }

  console.log("test 3");
  app.exit();
  console.log("test 3.2");
});

// プロセス終了のクリーンアップを行う
app.on("will-quit", async () => {
  // Windowsの場合のプロセス終了処理
  if (process.platform === "win32") {
    // 専用コマンドでプロセスを強制終了
    // await taskKillPromiseWithAppName("desktop-app.exe");
    // await taskKillPromiseWithAppName("在庫Z.exe");
    // await taskKillPromiseWithPid(process.pid);
    // await psTreePromise(process.pid);
    // try {
    //   await killChildrenWithSpawn(process.pid);
    // } catch (e) {
    //   console.log("taskKillPromise failed:", e);
    // }
    // try {
    //   await killParentWithSpawn(process.pid);
    //   logToFileWin("Parent process killed.");
    // } catch (e) {
    //   console.log("taskKillPromise failed:", e);
    //   logToFileWin(`Parent process faliled : ${e.message}`);
    // }
    // try {
    //   await killParentWithTreeKill;
    //   process.pid;
    //   logToFileWin("Parent process killed.");
    // } catch (e) {
    //   console.log("taskKillPromise failed:", e);
    //   logToFileWin(`Parent process faliled : ${e.message}`);
    // }
  }
  console.log("test 4");
  // logToFileMac(`Parent process test : `);
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
ipcMain.handle("get-app-url", () => appURLForStripe);

//====================================================================

// バックグラウンドウインドウを生成する関数です
function openBackGroundWindow() {
  backGroundWindow = new BrowserWindow({
    // width: 600,
    // height: 1200,
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
async function createMainWindow() {
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

  if (app.isPackaged) {
    // パッケージ化されたアプリの場合
    // pathname には、
    // app.getAppPath() で取得したアプリケーションのパスと、
    // build/index.html が結合されます。
    // protocol: 'file:' と slashes: true は、
    // ローカルファイルシステムの URL であることを示します。
    appURL = url.format({
      pathname: path.resolve(app.getAppPath(), "build/index.html"),
      protocol: "file:",
      slashes: true,
    });

    await localServerListener();
    appURLForStripe = `http://localhost:${assignedPort}`;
  } else {
    appURL = "http://localhost:3000";
    appURLForStripe = "http://localhost:3000";
  }

  mainWindow.loadURL(appURL);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  } else {
    // mainWindow.webContents.openDevTools(); // パッケージ化された状態でもデベロッパーツールを開く
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
    // prefWindow.webContents.openDevTools();
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
    // loginPromptWindow.webContents.openDevTools();
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
    // StockDetailWindow.webContents.openDevTools();
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

//========================================================================

// 立ち上がっていないローカルサーバーのインスタンスの作成
const localServer = express();
// port = 0 を指定すると、
// Node.jsが自動的に空いているポートを選んでくれます。
const port = 0;

localServer.get("/success", (req, res) => {
  // ここで支払いが成功した際のコールバック
  mainWindow.loadURL(appURL);
});

localServer.get("/cancel", (req, res) => {
  res.send("Payment was canceled. You can close this window.");
  // ここで支払いがキャンセルされた際のコールバック
  mainWindow.loadURL(appURL);
});

// ローカルサーバーを立ち上げる関数
async function localServerListener(): Promise<void> {
  // このコールバックは、サーバーが起動したときにのみ
  // 一度だけ実行されます。
  return new Promise((resolve, reject) => {
    httpServerObj = localServer.listen(port, () => {
      // 割り当てられたポート番号を取得
      const address = httpServerObj.address();
      if (typeof address === "object" && address !== null) {
        // TCPポートを使っている場合
        assignedPort = address.port.toString();
        console.log(
          `Local server is running at http://localhost:${assignedPort}`,
        );
        resolve();
      } else if (typeof address === "string") {
        // UNIXドメインソケットを使っている場合
        assignedPort = address; // これはソケットファイルのパスです
        console.log(`Server is running at ${assignedPort}`);
        resolve();
      } else {
        assignedPort = "-1";
        reject();
        reject(
          new Error(
            `Failed to retrieve server address. Using fallback value "-1"`,
          ),
        );
      }
      // サーバーが起動に失敗した場合のエラーハンドリング
      httpServerObj.on("error", (err) => {
        reject(new Error(`Local Server error: ${err.message}`));
      });
    });
  });
}
//========================================================================
