import { contextBridge, ipcRenderer, shell } from "electron";
import { scheduler } from "timers/promises";

// contextBridge.exposeInMainWorld は、
// 特定の関数やオブジェクトをレンダラープロセスの
// グローバルスコープ（windowオブジェクト）に公開します。
// これにより、レンダラープロセスで
// 直接呼び出すことができる関数を定義できます。
// 利点は、
// ・シンプルなAPIを公開できる。
// ・直接呼び出しが可能で、即時性が求められる処理に向いている。
contextBridge.exposeInMainWorld("myAPI", {
  counter: (count: number) => {
    return count + 1;
  },

  openExternal: (url) => {
    shell.openExternal(url);
    return null;
  },

  // ipcRenderer.invoke は、
  // レンダラープロセスからメインプロセスに
  // 非同期でリクエストを送信し、
  // メインプロセスで処理を行った後、
  // その結果をレンダラープロセスに返すために使用されます。
  // この方法は、プロミスベースの非同期通信を提供します。
  // 利点は、
  // ・非同期通信を簡単に実装できる。
  // ・複雑な処理や長時間かかる処理に向いている。
  // ・メインプロセスでのエラーハンドリングが簡単にできる。
  // .invokeは、呼び出す意味のメソッド
  runScraping: (asinDataList: AsinData[]) =>
    ipcRenderer.invoke("runScraping", asinDataList),

  stopScraping: () => ipcRenderer.invoke("stopScraping"),
  stopScheduledScraping: () => ipcRenderer.invoke("stop-scheduled-scraping"),

  saveData: (asinDataList: AsinData[]) =>
    ipcRenderer.invoke("save-data", asinDataList),

  loadData: () => ipcRenderer.invoke("load-data"),

  openLoginPrompt: () => ipcRenderer.invoke("open-login-prompt"),

  openStockDetail: (asinDataList: AsinData) =>
    ipcRenderer.invoke("open-stock-detail", asinDataList),

  scheduledScraping: (time: string, asinDataList: AsinData[]) =>
    ipcRenderer.invoke("schedule-scraping", time, asinDataList),

  getAppURL: () => ipcRenderer.invoke("get-app-url"),

  // ====================================================================

  initSystemStatus: (callback) =>
    ipcRenderer.on("init-system-status", callback),

  scrapingResult: (callback) => ipcRenderer.on("scraping-result", callback),

  receiveAsinData: (callback) => ipcRenderer.on("receive-asin-data", callback),

  initLogout: (callback) => {
    ipcRenderer.on("init-logout", callback);
  },
  initLogin: (callback) => {
    ipcRenderer.on("init-login", callback);
  },

  loadTransferData: (callback) =>
    ipcRenderer.on("load-transfer-data", callback),

  initScraping: (callback) => {
    ipcRenderer.on("init-scraping", callback);
  },

  initScheduledTime: (callback) => {
    ipcRenderer.on("init-scheduled-time", callback);
  },

  startScheduledScraping: (callback) => {
    ipcRenderer.on("start-scheduled-scraping", callback);
  },

  // ====================================================================

  disposeListener: (channel, callback) =>
    ipcRenderer.removeListener(channel, callback),

  disposeAllListeners: () => {
    ipcRenderer.removeAllListeners("scraping-result");
    ipcRenderer.removeAllListeners("receive-asin-data");
    ipcRenderer.removeAllListeners("init-logout");
    ipcRenderer.removeAllListeners("init-login");
    ipcRenderer.removeAllListeners("load-transfer-data");
    ipcRenderer.removeAllListeners("init-scraping");
    ipcRenderer.removeAllListeners("init-scheduled-time");
  },
});
