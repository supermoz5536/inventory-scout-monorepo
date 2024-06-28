import puppeteer, { Browser, Page, ElementHandle } from "puppeteer";
import { ipcMain } from "electron";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import UserAgent from "user-agents";

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
      console.log("2.1");
      const page = await browser.newPage();
      console.log("2.2");

      // ランダムなユーザーエージェントを設定
      // 生成されるエージェント情報をdesuktopのみに限定する。
      const userAgentOptions = {
        deviceCategory: "desktop",
      };
      const userAgent = new UserAgent(userAgentOptions).toString();
      console.log("2.4 userAgent = ", userAgent);
      await page.setUserAgent(userAgent);
      console.log("2.5");

      // ビューポートのサイズを指定
      await page.setViewport({ width: 1280, height: 960 });
      console.log("2.6");
      return page;
    },

    // accessProductPage: 指定したASINの商品ページにアクセスするメソッド
    // networkidle2: puppeteerのオプションで
    // ネットワーク接続が2本以下になるまで
    // ページの読み込みを安全に待機します。
    accessProductPage: async (asinData: AsinData, page: Page) => {
      console.log("3.1");
      await page.goto(`https://www.amazon.co.jp/dp/${asinData.asin}`, {
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

    fetchAndUpdateProductData: async (page: Page, asinData: AsinData) => {
      // ■ 商品名のセレクタを定義
      const productNameSelector = `span#productTitle`;
      // 商品名の要素を取得
      const productNameElement = await page.$(productNameSelector);
      // 商品名の要素からURLを抽出
      const productName = await page.evaluate(
        // 第一引数の関数
        (el) => {
          if (el) {
            const textContent = el.textContent;
            return textContent ? textContent.trim() : null;
          }
        },
        // 第二引数
        productNameElement
      );
      // 取得したデータに更新
      asinData.name = productName ?? "";

      // ■ 商品画像URLのセレクタを定義
      const imageURLSelector = `span[data-action="main-image-click"] img.a-dynamic-image`;
      // 商品画像URLの要素を取得
      const imageURLElement = await page.$(imageURLSelector);
      // 商品画像URLの要素からURLを抽出
      const imageURL = await page.evaluate(
        // 第一引数の関数
        (el) => {
          if (el) {
            return el.getAttribute("src");
          }
        },
        // 第二引数
        imageURLElement
      );
      // 取得したデータに更新
      asinData.imageURL = imageURL ?? "";

      // カート価格のセレクタを定義
      const cartPriceSelector = `div#centerCol.centerColAlign span.a-price-whole`;
      // カート価格の要素を取得
      const cartPriceElement = await page.$(cartPriceSelector);
      // カート価格の要素から価格文字列を抽出
      const cartPrice = await page.evaluate(
        // 第一引数の関数
        (el) => {
          if (el) {
            const textContent = el.textContent;
            return textContent ? textContent.trim() : null;
          }
        },
        // 第二引数
        cartPriceElement
      );
      // 取得したデータに更新
      asinData.cartPrice = cartPrice ?? "";
    },

    scrollOnDrawer: async (page: Page) => {
      await sleep(750);
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

          let previousPosition = await page.evaluate(() => window.scrollY);
          let samePositionTimes: number = 0;

          for (let i = 0; i < 6; i++) {
            console.log("i =", i);
            await page.mouse.wheel({
              deltaY: boundingBox.height,
            });

            // 要素のトップの高さを取得して強制的に更新
            await page.evaluate((selector) => {
              document.querySelector(selector);
            }, drawerSelector);

            await sleep(1500);
          }
        }
      }
    },

    // Drawer内のセラーID、出荷元、販売者データを取得
    fetchAndUpdateSellerData: async (page: Page, asinData: AsinData) => {
      // 各コンテナ情報を取得
      // .$は指定したCSSセレクタと一致する「最初の要素」を取得
      // .$$は指定したCSSセレクタと一致する「全ての要素」を取得するメソッド
      const offers = await page.$$("#aod-pinned-offer, #aod-offer");

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

        // 既存のリスト内に、fetchしたセラーIdがあるかを確認する
        const foundSellerData = asinData.fbaSellerDatas.find(
          (asinData) => asinData.sellerId === sellerId
        );

        // 既存のリストに含まれてるセラーで
        // かつ
        // 最新の出品者名の取得が成功した場合
        if (
          (foundSellerData && sellerName && shippingSource == "Amazon") ||
          (foundSellerData && sellerName && shippingSource == "Amazon.co.jp")
        ) {
          // 取得したデータの出品者名を上書きする
          foundSellerData.sellerName = sellerName;

          // 既存のリストに含まれない新規のセラーの場合
          // かつ
          // 最新の出品者名の取得が成功した場合
        } else if (
          (!foundSellerData &&
            sellerId &&
            sellerName &&
            shippingSource == "Amazon") ||
          (!foundSellerData &&
            sellerId &&
            sellerName &&
            shippingSource == "Amazon.co.jp")
        ) {
          // FbaSellerData型オブジェクト（出品者）を追加する。
          const newSellerData: FbaSellerData = {
            sellerId: sellerId,
            sellerName: sellerName,
            stockCountDatas: [],
          };
          asinData.fbaSellerDatas.push(newSellerData);
        }
      }
    },

    /// Drawer内の各セラーの「カートに入れる」をクリック
    addToCart: async (page: Page) => {
      console.log("3.8.0.1");
      // const offers = await page.$$("#aod-pinned-offer");
      const offers = await page.$$("#aod-pinned-offer, #aod-offer");
      console.log("3.8.0.2");

      for (let i = 0; i < offers.length; i++) {
        console.log("i=", i);
        // console.log("3.8.0");
        await sleep(500);

        // console.log("3.8.1");
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

        if (
          (addCartButton && shippingSource == "Amazon") ||
          (addCartButton && shippingSource == "Amazon.co.jp")
        ) {
          // 要素が安定するまで少し待つ
          await sleep(500);
          try {
            await addCartButton.click();
            if (i == 0) {
              await sleep(2000);
              await addCartButton.click();
            }
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

    closeDrawer: async (page: Page) => {
      await page.click("#aod-close");
      await sleep(1000);
    },

    /// 「カートに移動」をクリック
    goToCart: async (page: Page) => {
      await page.click("#nav-cart-count-container .nav-cart-icon");
      console.log("3.9.1");

      // // 「ショッピンカートページ」への画面遷移を待機します。
      // await page.waitForNavigation({ waitUntil: "networkidle2" });
      await sleep(2000);
      console.log("3.9.2");
    },

    fetchSellerId: async (page: Page, item: ElementHandle<HTMLDivElement>) => {
      // セラーID情報を含む要素のセレクターの定義
      const sellerIdSelector = 'a[href*="smid="]';
      // 要素を取得
      const sellerIdElement = await item.$(sellerIdSelector);
      console.log("sellerIdElement = ", sellerIdElement);

      // 要素からセラーIDのテキストデータを抽出
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
              const match = href ? href.match(/smid=([^&]+)/) : null;
              return match ? match[1] : null;
            },
            // 第二引数
            sellerIdElement
          )
        : // セラーIDのタグが見つからなかった場合
          null;

      console.log("fetchSellerId関数 sellerId = ", sellerId);

      return sellerId;
    },

    setQuantity: async (page: Page, item: ElementHandle<HTMLDivElement>) => {
      console.log("4.1.0");

      // ページの完全な読み込みを待つ

      await page.waitForSelector("body", { timeout: 10000 });

      console.log("4.1.1");

      await page.mouse.click(10, 10);

      console.log("4.1.２");

      console.log("4.2.1");

      await sleep(500);

      // プルダウンボタンの要素を取得
      const pulldownButton = await item.$(
        "span.a-button-inner > span.a-button-text.a-declarative"
      );
      console.log("4.2.2");

      if (pulldownButton) {
        console.log("4.2.3");
        // プルダウンボタンの要素をクリック
        await page.evaluate(async (button) => button.click(), pulldownButton);
        console.log("4.2.4");
      }
      console.log("4.2.5");

      // ポップオーバーメニューが表示されるまで待機
      const popoverSelector =
        "body > div.a-popover.a-dropdown.a-dropdown-common.a-declarative";
      await sleep(500);
      console.log("4.2.5.5");

      // 最後に追加生成されたポップオーバーメニューのコンテナを取得
      // 全ての要素を取得して、配列の最後の要素を指定
      const popoverElements = await page.$$(popoverSelector);
      const popoverElement = popoverElements[popoverElements.length - 1];
      console.log("4.2.5.5 popoverElement", popoverElement);

      if (popoverElement) {
        // 「10+」の要素のセレクタを宣言
        const element10Selector = "a#quantity_10";

        // 「10+」の要素が表示されるまで待機します。
        await page.waitForSelector(element10Selector);
        console.log("4.2.7");

        // 「10+」の要素を取得
        const element10 = await page.$(element10Selector);
        console.log("4.2.6 element10", element10);

        if (element10) {
          await sleep(500);
          await page.evaluate((button) => button.click(), element10);
          console.log("4.2.8");
        }
      }
      console.log("4.2.9");

      const inputBoxSelector = `input[type="text"]`;

      // 入力欄の表示を待機
      await page.waitForSelector(inputBoxSelector);
      console.log("4.3.0");

      // 入力欄の要素を取得
      const inputBox = await item.$(inputBoxSelector);
      console.log("4.3.1");
      if (inputBox) {
        // 入力欄を選択
        await page.evaluate((inputBox) => inputBox.click(), inputBox);
        console.log("4.3.2");

        // 入力欄に値を入力
        await page.evaluate((inputBox) => {
          inputBox.value = "999";
        }, inputBox);
        console.log("4.3.2.1");
      }
      console.log("4.3.3");

      await sleep(500);

      // 更新ボタン要素のセレクタの宣言
      const updateButtonSelector = `span.a-button-inner > a[data-action="update"].a-button-text`;

      // 更新ボタン要素の表示の待機
      await page.waitForSelector(updateButtonSelector);
      console.log("4.3.4");

      // 更新ボタン要素の取得
      const updateButton = await item.$(updateButtonSelector);

      // 更新ボタン要素をクリック
      if (updateButton) {
        await page.evaluate(
          (updateButton) => updateButton.click(),
          updateButton
        );
      }
      console.log("4.3.5");

      // 在庫数を表示するポップアップの表示完了を待機します。
      await sleep(750);
    },

    fetchStockCount: async (page: Page) => {
      console.log("5.1.1");
      const stockText = await page.evaluate(() => {
        // document: DOMのルートオブジェクト、HTMLドキュメント全体を表します。
        // querySelector: 指定されたCSSセレクタに一致する最初の要素を返します。
        const stockInfo = document.querySelector("div.a-popover-content");
        console.log("5.1.2");
        // オブジェクト取得があった場合、テキストデータが格納されたプロパティをreturn
        // オブジェクト取得がなかった場合、nullをreturn
        return stockInfo ? stockInfo.textContent : null;
      });
      console.log("5.1.3");

      // ポップアップのテキストが取得できた場合、
      const stockCountStr = stockText
        ? // \d は数字（0-9）を表します。
          // + は直前の項目が1回以上繰り返されることを意味します。
          // (\d+) は、1桁以上の連続する数字をキャプチャします。
          // この部分はキャプチャグループとして括られ、後で取り出すことができます。
          stockText.match(/この出品者のお取り扱い数は(\d+)点です。/)
        : null;
      console.log("5.1.4");

      if (stockCountStr) {
        const stockCountNum = parseInt(stockCountStr[1], 10);
        return stockCountNum;
      } else {
        return null;
      }
    },

    pushStockCount: async (
      asinData: AsinData,
      sellerId: string | null,
      stockCount: number | null
    ) => {
      // 追加する該当のセラーデータを探す。
      // asinData > fbaSellerDatas
      // 上記のFbaSellerData[]型オブジェクトの中から
      // セラーIDが一致するオブジェクトを検索する
      const foundFbaSellerData = asinData.fbaSellerDatas.find((seller) => {
        return seller.sellerId === sellerId;
      });

      // 在庫数の取得ができた場合
      if (foundFbaSellerData && stockCount) {
        console.log("6.0.0");

        // StockCount型のオブジェクトを作成する。
        const stockCountAndDate = { "2024-5-24": stockCount };
        console.log("6.0.1");

        // そのオブジェクトのstockCountプロパティに
        // 作成したStockCountをpushする。
        foundFbaSellerData.stockCountDatas.push(stockCountAndDate);

        // 在庫数を取得できない場合は
        // エラーフラグ（-100）で
        // 該当オブジェクトを更新
      } else if (foundFbaSellerData && stockCount === null) {
        console.log("6.0.3");
        const stockCountAndDate = { "2024-5-24": -100 };
        console.log("6.0.4");
        foundFbaSellerData.stockCountDatas.push(stockCountAndDate);
        console.log("6.0.5 after push", foundFbaSellerData.stockCountDatas);
      }
      console.log("6.0.6");
    },

    // scrollOnCartPage: async (page: Page) => {
    //   await page.evaluate(() => {
    //     // ページを一番上までスクロール
    //     window.scrollTo(0, 0);
    //   });
    // },

    // emptyCart: async (page: Page, ASIN: string) => {
    //   // ガート画面の各商品コンテナの最新データを再び全取得
    //   let items = await page.$$(
    //     `div[data-name="Active Items"] div[data-asin="${ASIN}"]`
    //   );

    //   while (items.length > 0) {
    //     console.log("6.1.1 現在のitem数 =", items.length);
    //     console.log("6.1.1 現在のitem[0] =", items[0]);

    //     // 削除ボタンの要素のセレクタを定義
    //     const deleteButtonSelector = `input[value="削除"][data-action="delete"]`;
    //     console.log("6.1.2");

    //     // 削除ボタンの要素の表示を待機
    //     await items[0].waitForSelector(deleteButtonSelector);

    //     console.log("6.1.3");

    //     // 削除ボタンの要素を取得
    //     const deleteButton = await items[0].$(deleteButtonSelector);
    //     console.log("6.1.4", deleteButton);

    //     // 削除ボタンをクリック
    //     if (deleteButton) {
    //       console.log("6.1.5");

    //       await page.evaluate((deleteButton) => {
    //         deleteButton.click();
    //       }, deleteButton);
    //       console.log("6.1.6");
    //     }
    //     console.log("6.1.7");

    //     // 削除の完了を待機
    //     // ■■■■■■ 待機スタックのリスク ■■■■■■
    //     // await page.waitForNavigation({ waitUntil: "networkidle2" });
    //     console.log("6.1.8");

    //     await sleep(500);
    //     // 強制的にページの状態を再評価（スクロールで）
    //     await page.evaluate(() => {
    //       window.scrollTo(0, 100);
    //     });
    //     await sleep(500);
    //     await page.evaluate(() => {
    //       window.scrollTo(0, -100);
    //     });

    //     // 強制的にページの状態を再評価（コンテクスト内でのJS実行で）
    //     const bodySelector =
    //       "body.a-m-jp a-aui_72554-c a-aui_a11y_2_750578-c a-aui_a11y_6_837773-c a-aui_a11y_sr_678508-t1 a-aui_amzn_img_959719-c a-aui_amzn_img_gate_959718-c a-aui_killswitch_csa_logger_372963-c a-aui_pci_risk_banner_210084-c a-aui_template_weblab_cache_333406-c a-aui_tnr_v2_180836-c a-meter-animate";
    //     const bodyElement = await page.$(bodySelector);

    //     if (bodyElement) {
    //       await page.evaluate((selector) => {
    //         const element = document.querySelector(selector);
    //         if (element) {
    //           // 必要な操作をここに記述
    //           element.setAttribute("data-tmp", "update"); // 一時的な属性を追加
    //           element.removeAttribute("data-tmp"); // 一時
    //         }
    //       }, bodySelector);
    //     }

    //     await sleep(2500);

    //     items = await page.$$(
    //       `div[data-name="Active Items"] div[data-asin="${ASIN}"]`
    //     );
    //     await sleep(1000);
    //   }
    // },

    clearCart: async (page: Page) => {
      console.log("7.0.0");
      // クッキーを削除してカート状態をリフレッシュする
      const client = await page.createCDPSession();
      await client.send("Network.clearBrowserCookies");

      console.log("7.0.1 Cart and session cleared.");
    },

    runScraping: async (
      event: Electron.IpcMainInvokeEvent,
      asinDataList: AsinData[]
    ) => {
      // scraperPromisの初期化（メンバ変数の宣言）部分が非同期なので
      // 同期化してからメソッド部分の非同期メソッドを各々実行
      const scrape = await scrapePromise;
      const browser = await scrape.launchBrowser();
      const page = await scrape.launchPage(browser);

      for (let asinData of asinDataList) {
        await scrape.accessProductPage(asinData, page);
        await scrape.fetchAndUpdateProductData(page, asinData);
        // 商品ページトップでカート取得してるセラー情報も取得
        // 「Amazonの他の出品者」が存在確認関数
        // ■ ある場合は、以下をifでラップ
        // openSellerDrawer - goToGart
        // ■ ない場合は、以下の2つの関数をif elseでラップ
        // elseなのは後から条件式を追加する可能性もあるため。
        // 「商品ページトップ」で「カートに追加」
        // 「カートの小計算ページ」で「カートに追加」
        await scrape.openSellerDrawer(page);
        await scrape.scrollOnDrawer(page);
        await scrape.fetchAndUpdateSellerData(page, asinData);
        await scrape.addToCart(page);
        await scrape.closeDrawer(page);
        await scrape.goToCart(page);

        // カート画面の各商品コンテナを全取得
        const items = await page.$$(
          `div[data-name="Active Items"] div[data-asin="${asinData.asin}"]`
        );

        for (const item of items) {
          const sellerId = await scrape.fetchSellerId(page, item);
          await scrape.setQuantity(page, item);
          const stockCount = await scrape.fetchStockCount(page);
          await scrape.pushStockCount(asinData, sellerId, stockCount);
        }

        // レンダラープロセスにデータを送信する
        // メインプロセスでのみ使用可能なメソッド。
        // scrapePromiseオブジェクトは、
        // 前提としてメインプロセス上にインポートされた上で
        // 実行されるので、エラーにならない。
        event.sender.send("scraping-result", asinData);
        console.log("send完了");

        await scrape.clearCart(page);
      }
    },
  };
})();

export default scrapePromise;
