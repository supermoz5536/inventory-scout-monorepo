import puppeteer, { Browser, Page } from "puppeteer";

// ■ クラスの定義
// 即時関数で全体をラッピングしてあるので
// 擬似的なオブジェクト指向となり
// 基本的なクラスを定義した記法と同じ構文になる
const scrapePromise = (async () => {
  // 初期化処理の設定はないので
  // 即時関数だがトリガーされるまで何も実行さない

  // 各メソッドの定義
  return {
    launchBrowser: async () => {
      const browser = await puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-infobars",
          "--window-position=0,0",
          "--ignore-certifcate-errors",
          "--ignore-certifcate-errors-spki-list",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1280,960",
        ],
      });
      console.log("1");
      return browser;
    },

    launchPage: async (browser: Browser) => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 960 }); // ビューポートのサイズを指定
      console.log("2");
      return page;
    },

    // accessProductPage: 指定したASINの商品ページにアクセスするメソッド
    // networkidle2: puppeteerのオプションで
    // ネットワーク接続が2本以下になるまで
    // ページの読み込みを安全に待機します。
    accessProductPage: async (ASIN: string, page: Page) => {
      console.log("3.1");
      await page.goto(`https://www.amazon.co.jp/dp/${ASIN}`, {
        waitUntil: "networkidle2",
      });
      console.log("3.2");
    },

    /// 「カートに入れる」をクリック
    addToCart: async (page: Page) => {
      // クリックするボタンをセレクタ（#add-to-cart-button）で指定します。
      await page.click("#add-to-cart-button");
      console.log("4");
      // 「カートの小計」への画面遷移を待機します。
      await page.waitForNavigation({ waitUntil: "networkidle2" });
      console.log("5");
    },

    /// 「カートに移動」をクリック
    goToCart: async (page: Page) => {
      await page.click("#hlb-view-cart-announce");
      console.log("6");
      // 「ショッピンカートページ」への画面遷移を待機します。
      await page.waitForNavigation({ waitUntil: "networkidle2" });
      console.log("7");
    },

    setQuantity: async (page: Page) => {
      // 「数量」のプルダウン（select[name="quantity"]）から
      //「10+」の項目を選択します。
      await page.select('select[name="quantity"]', "10+");
      console.log("8");
      // 数量の入力ボックス（input[name="quantityBox"]）が表示されるまで待機します。
      // ■■■■■■■ 待機系メソッドが原因でスタックすることがあるので注意 ■■■■■■■
      await page.waitForSelector('input[name="quantityBox"]');
      console.log("10");
      // 数量の入力ボックスに「999」を入力(type)します。
      await page.type('input[name="quantityBox"]', "999");
      console.log("11");
      // 更新ボタンを押して入力完了します。
      await page.click('input[value="更新"]');
      console.log("12");
      // 在庫数を表示するポップアップの表示完了を待機します。
      await page.waitForNavigation({ waitUntil: "networkidle2" });
      console.log("13");
    },

    getStockCount: async (page: Page) => {
      // page.evaluateメソッドを使用すると、
      // 指定した関数をブラウザのコンテキスト内で実行し、
      // その関数が返す結果を取得することができます。
      console.log("14.1");
      const stockText = await page.evaluate(() => {
        // document: DOMのルートオブジェクト、HTMLドキュメント全体を表します。
        // querySelector: 指定されたCSSセレクタに一致する最初の要素を返します。
        const stockInfo = document.querySelector(".a-popover-inner");
        console.log("14.2");
        // オブジェクト取得があった場合、テキストデータが格納されたプロパティをreturn
        // オブジェクト取得がなかった場合、nullをreturn
        return stockInfo ? stockInfo.textContent : null;
      });
      console.log("15");

      // ポップアップのテキストが取得できた場合、
      const stockCount = stockText
        ? // \d は数字（0-9）を表します。
          // + は直前の項目が1回以上繰り返されることを意味します。
          // (\d+) は、1桁以上の連続する数字をキャプチャします。
          // この部分はキャプチャグループとして括られ、後で取り出すことができます。
          stockText.match(/この出品者のお取り扱い数は(\d+)点です。/)
        : null;
      console.log("16");
      return stockCount ? stockCount[1] : "N/A";
    },

    emptyCart: async (page: Page) => {
      // 削除ボタンをクリック
      await page.click(".sc-action-delete input");
      console.log("17");
      // 削除の完了を待機
      await page.waitForNavigation({ waitUntil: "networkidle2" });
      console.log("18");
    },

    runScraping: async (ASIN: string) => {
      // scraperPromisの初期化（メンバ変数の宣言）部分が非同期なので
      // 同期化してからメソッド部分の非同期メソッドを各々実行
      const scraper = await scrapePromise;
      const browser = await scraper.launchBrowser();
      const page = await scraper.launchPage(browser);
      await scraper.accessProductPage(ASIN, page);
      await scraper.addToCart(page);
      await scraper.goToCart(page);
      await scraper.setQuantity(page);
      const stockCount = await scraper.getStockCount(page);
      console.log(`在庫数: ${stockCount}`);
      await scraper.emptyCart(page);
    },
  };
})();

export default scrapePromise;
