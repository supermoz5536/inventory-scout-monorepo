import { contextBridge, ipcRenderer, shell } from "electron";

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

  scrapingResult: (callback) => ipcRenderer.on("scraping-result", callback),

  removeScrapingResult: (callback) =>
    ipcRenderer.removeListener("scraping-result", callback),
});
