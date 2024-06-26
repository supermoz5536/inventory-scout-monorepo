// レンダラープロセスのグローバル型定義を明示的に参照します
// 一度グローバルな型定義ファイルが参照されると、
// その型定義はプロジェクト（メインプロセス）全体に適用されます。
// なので、自動的にpreload.tsでも参照が反映されます。
/// <reference path="../src/@types/global.d.ts" />

import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import scrapePromis from "../src/components/Scrape";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1150,
    height: 870,
    // resizable: false, // ウィンドウサイズを変更できないようにする
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // sandbox: trueにするとmainとrendererプロセス間の隔離が強化されて
      // preload.tsの読み込みに失敗します。
      sandbox: false,
    },
  });

  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "../index.html"),
        protocol: "file:",
        slashes: true,
      })
    : "http://localhost:3000";

  win.loadURL(appURL);

  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }
};

ipcMain.handle("runScraping", async (event, asinDataList: AsinData[]) => {
  try {
    const scrape = await scrapePromis;
    scrape.runScraping(event, asinDataList);
  } catch (error) {
    console.error("MyAPI scrape ERROR", error);
    return "MyAPI scrape ERROR"; // エラーメッセージを返す
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
