import puppeteer, { Browser, Page } from "puppeteer";

// ■ クラスの定義
// 即時関数で全体をラッピングしてあるので
// 擬似的なオブジェクト指向となり
// 基本的なクラスを定義した記法と同じ構文になる
const scrapePromise = (async () => {
  // 即時関数で立ち上げ直後に読み込まれる初期化処理

  /// 指定された時間だけ処理を遅延させる関数の宣言
  const sleep = (time: number) =>
    // new Promiseは、コンストラクタ関数で
    // Promise(非同期)オブジェクトを生成します。
    //
    // Promiseコンストラクタには1つの関数の引数が必要です。
    // この関数は2つの引数（resolve, reject）を取りますが、
    // この場合はresolveのみを使用しています。
    //
    // resolveはPromiseを成功（完了）としてマークするための関数です。
    // setTimeoutは、指定された時間（ミリ秒）後に指定された関数を実行します。
    //
    // resolve関数をsetTimeoutに渡し
    // setTimeoutが指定された時間後にresolveを呼び出し、
    // Promiseを完了します。
    new Promise((resolve) => setTimeout(resolve, time));

  // 各メソッドの定義
  return {
    launchBrowser: async () => {
      const browser = await puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox", // サンドボックスはセキュリティ機能であり、これを無効にすることでブラウザがより軽量に実行されます。
          "--disable-setuid-sandbox", // --no-sandboxと一緒に使われ、同様の理由でサンドボックスを無効にします。
          "--disable-infobars", // Chromeブラウザが「Chromeは自動テスト ソフトウェアによって制御されています」という情報バーを表示するのを無効にします。このバーが表示されると、スクレイピングツールの使用が検知されやすくなります。
          "--window-position=0,0", // ウィンドウの位置を画面の左上に設定することで、ブラウザウィンドウが特定の位置に固定されます。これは人間が操作しているブラウザの挙動に近づけるために使われます。
          "--ignore-certifcate-errors", // SSL証明書のエラーを無視することで、自己署名証明書や期限切れの証明書が原因でページの読み込みが失敗するのを防ぎます。
          "--ignore-certifcate-errors-spki-list", // 特定のSPKIリストに関連する証明書エラーを無視します。これもSSL証明書の問題を回避するためです。
          "--disable-dev-shm-usage", // 共有メモリの使用を無効にすることで、メモリ使用量を抑え、ブラウザのクラッシュを防ぐことができます。
          "--disable-accelerated-2d-canvas", // 2Dキャンバスのハードウェアアクセラレーションを無効にすることで、描画の問題やブラウザのクラッシュを防ぎます。
          "--disable-gpu", // GPUを無効にすることで、GPU関連のクラッシュを防ぎます。
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

    /// 新品の出品リンクをクリックして
    // 出品者一覧のDrawerを展開
    openSellerDrawer: async (page: Page) => {
      // 「新品の出品」のリンクをセレクタで指定してクリックします。
      await page.click('a[href*="/gp/offer-listing/"][href*="condition=NEW"]');
      console.log("3.3");
      // 出品者一覧ページへの画面遷移を待機します。
      await page.waitForNavigation({ waitUntil: "networkidle2" });
      console.log("3.4");
    },

    // /// 絞り込みボタンをクリックしてプルダウンを展開
    // applyFilters: async (page: Page) => {
    //   // 絞り込みボタンが表示されるまで待機します。
    //   await page.waitForSelector(
    //     ".a-button.a-button-dropdown.a-button-base.aod-filter-button-div",
    //     { timeout: 10000 }
    //   );
    //   console.log("3.5");
    //   // 絞り込みボタンをクリック
    //   await sleep(1000);
    //   await page.click(
    //     ".a-button.a-button-dropdown.a-button-base.aod-filter-button-div"
    //   );
    //   console.log("3.5");
    //   // プライムのチェックボックスが表示されるのを待機
    //   await page.waitForSelector('#primeEligible input[type="checkbox"]', {
    //     timeout: 10000,
    //   });
    //   console.log("3.5.1");
    //   // プライムのチェックボックスをクリック
    //   await page.click('#primeEligible input[type="checkbox"]');
    //   await sleep(1000);

    //   console.log("3.6");
    //   // 新品のチェックボックスをクリック
    //   await page.click('#new input[type="checkbox"]');
    //   console.log("3.7");

    //   // フィルタリング後にマウスを移動させる
    //   // ウィンドウの左上隅にマウスを移動させる（座標(0, 0)）
    //   await page.mouse.move(0, 0);
    //   console.log("3.7.1");
    // },

    scrollToBottom: async (page: Page) => {
      await sleep(1500);
      const drawerSelector = "#all-offers-display";
      const drawerElement = await page.$(drawerSelector);
      console.log("drawerElement", drawerElement);

      if (drawerElement) {
        const boundingBox = await drawerElement.boundingBox();

        if (boundingBox) {
          await page.mouse.move(
            boundingBox.x + boundingBox.width / 2,
            boundingBox.y + boundingBox.height / 2
          );

          for (let i = 0; i < 5; i++) {
            await page.mouse.wheel({ deltaY: boundingBox.height });

            // 要素のトップの高さを取得
            await page.evaluate((selector) => {
              document.querySelector(selector);
            }, drawerSelector);

            await sleep(1500); // 500ms待機
          }

          for (let i = 0; i < 5; i++) {
            await page.mouse.wheel({ deltaY: -boundingBox.height });
            await sleep(1500); // 500ms待機
          }
        }
      }
    },

    // scrollToBottom: async (page: Page) => {
    //   await sleep(3000);

    //   const drawerSelector = "#all-offers-display";

    //   for (let i = 0; i < 5; i++) {
    //     const drawerElement = await page.$(drawerSelector);
    //     console.log("drawerElement", drawerElement);

    //     if (drawerElement) {
    //       const boundingBox = await drawerElement.boundingBox();

    //       if (boundingBox) {
    //         await page.mouse.move(
    //           boundingBox.x + boundingBox.width / 2,
    //           boundingBox.y + boundingBox.height / 2
    //         );

    //         console.log("boundingBox", boundingBox);
    //         console.log("i =", i);
    //         await page.mouse.wheel({ deltaY: 960 });

    //         await sleep(2000); // 2秒待機
    //       }
    //     }
    //   }

    //   for (let i = 0; i < 5; i++) {
    //     const drawerElement = await page.$(drawerSelector);
    //     console.log("drawerElement", drawerElement);

    //     if (drawerElement) {
    //       const boundingBox = await drawerElement.boundingBox();

    //       if (boundingBox) {
    //         await page.mouse.move(
    //           boundingBox.x + boundingBox.width / 2,
    //           boundingBox.y + boundingBox.height / 2
    //         );

    //         console.log("boundingBox", boundingBox);
    //         console.log("i =", i);
    //         await page.mouse.wheel({ deltaY: -960 });
    //         await sleep(2000); // 2秒待機
    //       } else {
    //         console.log("Bounding box not found");
    //         break;
    //       }
    //     } else {
    //       console.log("Drawer element not found");
    //       break;
    //     }
    //   }
    // },

    // Drawer内のセラーID、出荷元、販売者データを取得
    getSellerInfo: async (page: Page) => {
      // 各コンテナ情報を取得
      // .$は指定したCSSセレクタと一致する「最初の要素」を取得
      // .$$は指定したCSSセレクタと一致する「全ての要素」を取得するメソッド
      const offers = await page.$$("#aod-pinned-offer, #aod-offer");

      // 取得した情報を格納するための空の配列を用意
      const sellerInfos = [];

      // 各コンテナをループで処理
      for (const offer of offers) {
        // CSSセレクタの記述では、
        // スペースで区切るだけで、
        // 親子関係の指定ができます。

        // セラーIDが含まれる要素の参照を取得
        // <a>タグ（アンカータグ）で、href属性に"/gp/aag/main"を含む要素を指定します。
        const sellerIdElement = await offer.$('a[href*="/gp/aag/main"]');

        // 出荷元の名前が含まれる要素の参照を取得
        const shippingSourceElement = await offer.$(
          "#aod-offer-shipsFrom .a-size-small.a-color-base"
        );

        // 販売元の名前が含まれる要素の参照を取得
        const sellerNameElement = await offer.$(
          "#aod-offer-soldBy .a-size-small.a-link-normal"
        );

        // セラーIDの抽出処理
        const sellerId = sellerIdElement
          ? // セラーIDのタグが見つかった場合
            // .evaluate: ページ内でJavaScriptを実行するメソッド
            // 第一引数に、ページ内で実行する関数を指定
            // 第二引数に、第一引数の関数に渡す引数を指定（ここではsellerIdElement）。
            await page.evaluate(
              // 引数として受け取ったel（要素）から
              // href属性の値を取得し、
              // 正規表現を使用してセラーIDを抽出します。
              // []内の^は否定を意味し、
              // [^&]+ は & 以外の文字が1回以上続く部分にマッチし、
              // & が出現した時点でマッチが終了します。

              // 第一引数の関数
              (el) => {
                const href = el.getAttribute("href");
                const match = href ? href.match(/seller=([^&]+)/) : null;
                return match ? match[1] : null;
              },
              // 第二引数
              sellerIdElement
            )
          : // セラーIDのタグが見つからなかった場合
            null;

        // 出荷元名の抽出処理
        // 要素が存在する場合は
        // そのテキストを取得しトリムする
        const shippingSource = shippingSourceElement
          ? await page.evaluate((el) => {
              const textContent = el.textContent;
              return textContent ? textContent.trim() : null;
            }, shippingSourceElement)
          : null;

        // 販売元の名前を抽出
        // テキストコンテンツを取得しトリムする
        const sellerName = sellerNameElement
          ? await page.evaluate((el) => {
              const textContent = el.textContent;
              return textContent ? textContent.trim() : null;
            }, sellerNameElement)
          : null;

        // 取得した情報をオブジェクトとして配列に追加
        sellerInfos.push({ sellerId, shippingSource, sellerName });
      }
      console.log("sellerInfos", sellerInfos);

      // すべてのオファーから取得した情報が入った配列を返す
      return sellerInfos;
    },

    /// Drawer内の各セラーの「カートに入れる」をクリック
    addToCart: async (page: Page) => {
      await sleep(1000);
      console.log("3.8.0.1");
      // const offers = await page.$$("#aod-pinned-offer");
      const offers = await page.$$("#aod-pinned-offer, #aod-offer");
      console.log("3.8.0.2");
      console.log("3.8.0.2", offers);

      for (let i = 0; i < offers.length; i++) {
        console.log("3.8.0");
        await sleep(1000);

        console.log("3.8.1");
        let addCartButton = await offers[i].$(
          `span.a-button-inner .a-button-input`
        );
        // 出荷元の名前が含まれる要素の参照を取得
        const shippingSourceElement = await offers[i].$(
          "#aod-offer-shipsFrom .a-size-small.a-color-base"
        );

        const shippingSource = shippingSourceElement
          ? await page.evaluate((el) => {
              const textContent = el.textContent;
              return textContent ? textContent.trim() : null;
            }, shippingSourceElement)
          : null;

        console.log("3.8.2");
        if (addCartButton && shippingSource == "Amazon") {
          await sleep(1000); // 要素が安定するまで少し待つ
          try {
            await addCartButton.click();
            console.log(`Offer ${i} added to cart successfully.`);
          } catch (error) {
            console.error(`Failed to add offer ${i} to cart:`, error);

            // エラーが発生した場合、要素を再取得して再試行
            await sleep(1000);
            addCartButton = await offers[i].$(
              "span.a-button-inner .a-button-input"
            );
            if (addCartButton) {
              try {
                await addCartButton.click();
                console.log(`Offer ${i} added to cart successfully on retry.`);
              } catch (retryError) {
                console.error(
                  `Retry failed to add offer ${i} to cart:`,
                  retryError
                );
              }
            }
          }

          console.log("3.8.3");
        }
        console.log("3.8.4");
      }
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
      const scrape = await scrapePromise;
      const browser = await scrape.launchBrowser();
      const page = await scrape.launchPage(browser);
      await scrape.accessProductPage(ASIN, page);
      await scrape.openSellerDrawer(page);
      await scrape.scrollToBottom(page);
      // await scrape.applyFilters(page);
      await scrape.getSellerInfo(page);
      await scrape.addToCart(page);
      // await scraper.goToCart(page);
      // await scraper.setQuantity(page);
      // const stockCount = await scraper.getStockCount(page);
      // console.log(`在庫数: ${stockCount}`);
      // await scraper.emptyCart(page);
    },
  };
})();

export default scrapePromise;
