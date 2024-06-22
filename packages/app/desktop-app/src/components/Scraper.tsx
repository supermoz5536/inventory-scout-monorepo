import puppeteer from "puppeteer";

// ■ クラスの定義
// 即時関数で全体をラッピングしてあるので
// 擬似的なオブジェクト指向となり
// 基本的なクラスを定義した記法と同じ構文になる
const scraperPromise = (async () => {
  // ■ 初期化処理（ ≒ メンバ変数の定義）
  // Puppeteerのブラウザとページを立ち上げる
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 各メソッドの定義
  return {
    // accessProductPage: 指定したASINの商品ページにアクセスするメソッド
    // networkidle2: puppeteerのオプションで
    // ネットワーク接続が2本以下になるまで
    // ページの読み込みを安全に待機します。
    accessProductPage: async (ASIN: string) => {
      await page.goto(`https://www.amazon.co.jp/dp/${ASIN}`, {
        waitUntil: "networkidle2",
      });
    },

    /// 「カートに入れる」をクリック
    addToCart: async () => {
      // クリックするボタンをセレクタ（#add-to-cart-button）で指定します。
      await page.click("#add-to-cart-button");
      // 「カートの小計」への画面遷移を待機します。
      await page.waitForNavigation({ waitUntil: "networkidle2" });
    },

    /// 「カートに移動」をクリック
    goToCart: async () => {
      await page.click("#hlb-view-cart-announce");
      // 「ショッピンカートページ」への画面遷移を待機します。
      await page.waitForNavigation({ waitUntil: "networkidle2" });
    },

    setQuantity: async () => {
      // 「数量」のプルダウン（select[name="quantity"]）から
      //「10+」の項目を選択します。
      await page.select('select[name="quantity"]', "10+");
      // 数量の入力ボックス（input[name="quantityBox"]）が表示されるまで待機します。
      // ■■■■■■■ 待機系メソッドが原因でスタックすることがあるので注意 ■■■■■■■
      await page.waitForSelector('input[name="quantityBox"]');
      // 数量の入力ボックスに「999」を入力(type)します。
      await page.type('input[name="quantityBox"]', "999");
      // 更新ボタンを押して入力完了します。
      await page.click('input[value="更新"]');
      // 在庫数を表示するポップアップの表示完了を待機します。
      await page.waitForNavigation({ waitUntil: "networkidle2" });
    },

    getStockCount: async () => {
      // page.evaluateメソッドを使用すると、
      // 指定した関数をブラウザのコンテキスト内で実行し、
      // その関数が返す結果を取得することができます。
      const stockText = await page.evaluate(() => {
        // document: DOMのルートオブジェクト、HTMLドキュメント全体を表します。
        // querySelector: 指定されたCSSセレクタに一致する最初の要素を返します。
        const stockInfo = document.querySelector(".a-popover-inner");
        // オブジェクト取得があった場合、テキストデータが格納されたプロパティをreturn
        // オブジェクト取得がなかった場合、nullをreturn
        return stockInfo ? stockInfo.textContent : null;
      });

      // ポップアップのテキストが取得できた場合、
      const stockCount = stockText
        ? // \d は数字（0-9）を表します。
          // + は直前の項目が1回以上繰り返されることを意味します。
          // (\d+) は、1桁以上の連続する数字をキャプチャします。
          // この部分はキャプチャグループとして括られ、後で取り出すことができます。
          stockText.match(/この出品者のお取り扱い数は(\d+)点です。/)
        : null;
      return stockCount ? stockCount[1] : "N/A";
    },

    emptyCart: async () => {
      // 削除ボタンをクリック
      await page.click(".sc-action-delete input");
      // 削除の完了を待機
      await page.waitForNavigation({ waitUntil: "networkidle2" });
    },

    runScraping: async (ASIN: string) => {
      // scraperPromisの初期化（メンバ変数の宣言）部分が非同期なので
      // 同期化してからメソッド部分の非同期メソッドを各々実行
      const scraper = await scraperPromise;
      await scraper.accessProductPage(ASIN);
      await scraper.addToCart();
      await scraper.goToCart();
      await scraper.setQuantity();
      const stockCount = await scraper.getStockCount();
      console.log(`在庫数: ${stockCount}`);
      await scraper.emptyCart();
    },
  };
})();

export default scraperPromise;
