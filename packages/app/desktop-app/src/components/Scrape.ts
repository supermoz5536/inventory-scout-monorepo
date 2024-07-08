import puppeteer, { Browser, Page, ElementHandle } from "puppeteer";
import { ipcMain } from "electron";
import { useSelector } from "react-redux";
import UserAgent from "user-agents";

// ■ クラスの定義
// 即時関数で全体をラッピングしてあるので
// 擬似的なオブジェクト指向となり
// 基本的なクラスを定義した記法と同じ構文になる
const scrapePromise = (async () => {
  // 即時関数で立ち上げ直後に読み込まれる初期化処理

  /// ■ 指定された時間だけ処理を遅延させる関数の宣言
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

  // ■ タイムアウトを設定する関数
  const withTimeout = (
    promise: Promise<any>,
    timeout: number,
    errorMessage: string
    // この関数は、Promiseを返すことを示しています。
  ): Promise<any> => {
    let timer: any;
    return Promise.race([
      // 配列で渡した2つのプロミスを同時起動して
      // 先に解決or失敗がリターンされたプロミスの結果で出力する

      // 非同期処理用のプロミス
      // scrapingProcessの解決を期待します。
      promise,

      // timeout用のプロミスオブジェクトを生成します。
      // 時限爆弾のようなものです。
      // ・第1引数: プロミス成功時にトリガーされる関数
      // ・第2引数: プロミス失敗時にトリガーされる関数
      // タイムアウトエラーを期待するので
      // 第2引数のみ使用します。
      new Promise((_, reject) => {
        // setTimeout関数は、
        // 指定時間（ミリ秒）後に関数を着火します。
        // ・第1引数: 時間後にトリガーされる関数
        // ・第2引数: 遅延時間(ms)

        // reject 関数は Promise を失敗させます。
        // mew Error(errorMessage) は新規オブジェクトを生成します。
        timer = setTimeout(() => reject(new Error(errorMessage)), timeout);
      }),
      // setTimeoutの戻り値はタイマーIDであり、
      // このIDでタイマーをキャンセルできます。
      // 非同期処理が成功した場合のために
      // コールバックで、事前にタイマーをキャンセルします。
    ]).finally(() => clearTimeout(timer));
  };

  /// 次の条件を満たすasinDataのみスクレイピングします。
  /// ・「当日の取得履歴がある」かつ「最後の取得から8時間以上経過」
  /// ・「別日の取得履歴がある」 かつ 「最後の取得から8時間以上経過」
  /// ・取得履歴がない（初期状態）

  const getFilteredAsinDataList = (asinDataList: AsinData[]) => {
    return asinDataList.filter((asinData) => {
      // const now = new Date();
      // const lastFetchDate = new Date(asinData.fetchLatestDate);
      // // 36e5は1時間のms単位の秒数 3600000 を意味します。
      // // .getTimeでms単位でのそのオブジェクトの現在時刻の値を取得します。
      // const hoursDiff = (now.getTime() - lastFetchDate.getTime()) / 36e5;

      return (
        // // toDateSringで日付の値をString型で取得します。
        // now.toDateString() !== lastFetchDate.toDateString() ||
        // hoursDiff > 8 ||
        // asinData.fetchLatestDate === ""
        asinData.isScraping === true || asinData.fetchLatestDate === ""
      );
    });
  };

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
      return browser;
    },

    launchPage: async (browser: Browser) => {
      const page = await browser.newPage();

      // ランダムなユーザーエージェントを設定
      // 生成されるエージェント情報をdesuktopのみに限定する。
      const userAgentOptions = {
        deviceCategory: "desktop",
      };
      const userAgent = new UserAgent(userAgentOptions).toString();
      await page.setUserAgent(userAgent);

      // ビューポートのサイズを指定
      await page.setViewport({ width: 1280, height: 960 });
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

    checkDrawer: async (page: Page) => {
      // drawerのセレクタを定義
      const drawerSelector = `a[href*="/gp/offer-listing/"][href*="condition=NEW"]`;
      // drawerの要素を取得
      const drawerElement = await page.$(drawerSelector);
      // 要素が取得したらTrue
      // 要素が取得できなかったらfalse
      return drawerElement ? true : false;
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

    avoidPopupClick: async (page: Page) => {
      // ページの完全な読み込みを待つ
      console.log("4.1.1");
      await page.waitForSelector("body", { timeout: 10000 });
      console.log("4.1.2");
      await page.mouse.click(10, 10);
      console.log("4.1.3");
      await sleep(1000);
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

      // ■ 親ASINのタグ(script)を取得（scriptタグ全てが親ASINを含んでる可能性がある）
      const scriptElements = await page.$$("script");

      // 各scriptタグのテキスト内容を抽出
      // Promise.allは、複数のプロミス（非同期操作）を並列に実行し、
      // すべてが完了するまで待機します。
      const scriptContents = await Promise.all(
        scriptElements.map(async (scriptElement) => {
          return await page.evaluate(
            (scriptElement) => scriptElement.textContent,
            scriptElement
          );
        })
      );

      // 親ASINを含むscriptタグを見つける
      const targetScript = scriptContents.find((script) => {
        return script && script.includes("twister-js-init-mason-data");
      });

      // 親ASINの抽出処理

      // ターゲットスクリプから該当部分の文字列を正規表現で抽出
      const match = targetScript
        ? targetScript.match(/parentAsin=([^&]+)/)
        : null;

      const asinParent = match ? match[1] : null;
      // 抽出できた場合のみオリジナルのasinDataに書き込み
      if (asinParent) asinData.asinParent = asinParent;
    },

    scrollOnDrawer: async (page: Page) => {
      await sleep(750);
      const drawerSelector = "#all-offers-display";
      const drawerElement = await page.$(drawerSelector);

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
    fetchAndCountSellerOnDrawer: async (
      page: Page,
      asinData: AsinData,
      totalFbaSeller: { value: number }
    ) => {
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

          // Amazon本体以外のFBAセラーの場合に
          // fbaSellerNOPにカウント
          if (shippingSource !== "Amazon.co.jp") {
            ++totalFbaSeller.value;
          }

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

          // Amazon本体以外のFBAセラーの場合に
          // fbaSellerNOPにカウント
          if (shippingSource !== "Amazon.co.jp") {
            ++totalFbaSeller.value;
          }
        }
      }
    },

    /// Drawer内の各セラーの「カートに入れる」をクリック
    addToCartOnDrawer: async (page: Page) => {
      console.log("3.8.0.1");
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

    fetchAndCountSellerOnTop: async (
      page: Page,
      asinData: AsinData,
      totalFbaSeller: { value: number }
    ) => {
      console.log("B 0.0.0");
      // セラーIDが含まれる要素を取得
      const sellerIdElement = await page.$('a[href*="seller=');
      console.log("B 0.0.1");
      // 出荷元の名前が含まれる要素を取得
      const shippingSourceElement = await page.$(
        `div.offer-display-features-container span.a-size-small.offer-display-feature-text-message`
      );
      console.log("B 0.0.2");
      // 販売元の名前が含まれる要素を取得
      const sellerNameElement = await page.$(
        `div.offer-display-features-container a#sellerProfileTriggerId`
      );
      console.log("B 0.0.3");
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
      console.log("B 0.0.4");
      // 出荷元名の抽出処理
      // 要素が存在する場合は
      // そのテキストを取得しトリムする
      const shippingSource = shippingSourceElement
        ? await page.evaluate((el) => {
            const textContent = el.textContent;
            return textContent ? textContent.trim() : null;
          }, shippingSourceElement)
        : null;
      console.log("B 0.0.5");
      // 販売元の名前を抽出
      // テキストコンテンツを取得しトリムする
      const sellerName = sellerNameElement
        ? await page.evaluate((el) => {
            const textContent = el.textContent;
            return textContent ? textContent.trim() : null;
          }, sellerNameElement)
        : null;
      console.log("B 0.0.6");
      // 既存のリスト内に、fetchしたセラーIdがあるかを確認する
      const foundSellerData = asinData.fbaSellerDatas.find(
        (asinData) => asinData.sellerId === sellerId
      );
      console.log("B 0.0.7");
      // 既存のリストに含まれてるセラーで
      // かつ
      // 最新の出品者名の取得が成功した場合
      if (
        (foundSellerData && sellerName && shippingSource == "Amazon") ||
        (foundSellerData && sellerName && shippingSource == "Amazon.co.jp")
      ) {
        console.log("B 0.0.8");
        // 取得したデータの出品者名を上書きする
        foundSellerData.sellerName = sellerName;
        console.log("B 0.0.9");
        // Amazon本体以外のFBAセラーの場合に
        // fbaSellerNOPにカウント
        if (shippingSource !== "Amazon.co.jp") {
          ++totalFbaSeller.value;
        }

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

        // Amazon本体以外のFBAセラーの場合に
        // fbaSellerNOPにカウント
        if (shippingSource !== "Amazon.co.jp") {
          ++totalFbaSeller.value;
        }
      }
    },

    reloadPage: async (page: Page) => {
      // ページをリロードする
      await page.reload({ waitUntil: ["networkidle2", "domcontentloaded"] });
      console.log("Page reloaded successfully.");
    },

    addToCartOnTop: async (page: Page) => {
      // セレクタを定義
      const addCartButtonSelector = `input#add-to-cart-button`;

      // 要素を取得
      const addCartButton = await page.$(addCartButtonSelector);

      // 要素をクリック
      if (addCartButton) {
        await page.evaluate((addCartButton) => {
          addCartButton.click();
        }, addCartButton);
      }

      await sleep(2000);
    },

    setQuantity: async (page: Page, item: ElementHandle<HTMLDivElement>) => {
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

    countTotalStock(totalStock: { value: number }, stockCount: number | null) {
      if (stockCount) {
        totalStock.value += stockCount;
      }
    },

    fetchSellerId: async (page: Page, item: ElementHandle<HTMLDivElement>) => {
      // セラーID情報を含む要素のセレクターの定義
      const sellerIdSelector = 'a[href*="smid="]';
      // 要素を取得
      const sellerIdElement = await item.$(sellerIdSelector);

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

      return sellerId;
    },

    updateAmazonStock(
      asinData: AsinData,
      stockCount: number | null,
      sellerId: string | null
    ) {
      if (sellerId === "AN1VRQENFRJN5" && stockCount) {
        asinData.amazonStock = stockCount;
      }
    },

    updateStockCount: async (
      asinData: AsinData,
      stockCount: number | null,
      sellerId: string | null,
      today: Date
    ) => {
      // 日付を YYYY-MM-DD 形式にフォーマット
      // getMonth() + 1: 月を取得（0から始まるため1を加算）
      // padStart(2, '0'): 月と日が一桁の場合、前に0を追加して二桁にする
      const todayFormatted = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // 追加する該当のセラーデータを探す。
      // asinData > fbaSellerDatas
      // 上記のFbaSellerData[]型オブジェクトの中から
      // セラーIDが一致するオブジェクトを検索する
      const foundFbaSellerData = asinData.fbaSellerDatas.find((seller) => {
        return seller.sellerId === sellerId;
      });

      // 在庫数の取得とセラーデータが見つかった場合
      if (foundFbaSellerData && stockCount) {
        console.log("6.0.0");

        // StockCount型のオブジェクトを作成する。
        const stockCountAndDate = {
          [todayFormatted]: stockCount,
        };
        console.log("6.0.1");

        // 今日の日付と一致するStackCountDataを削除します
        foundFbaSellerData.stockCountDatas =
          foundFbaSellerData.stockCountDatas.filter(
            // Object.key()メソッドは
            // 引数のオブジェクトのkeyを配列で出力し
            // 今日の日付と一致 "しない" 要素のみで構成される配列を生成します。
            // つまり 今日の日付のオブジェクトを
            // 元の配列から削除するのと同じ結果になります。
            (stockCountData) =>
              !Object.keys(stockCountData).includes(todayFormatted)
          );

        // 新規のStockCountDataを追加します。
        foundFbaSellerData.stockCountDatas.push(stockCountAndDate);

        // 在庫数を取得できない場合は
        // エラーフラグ（-100）で
        // 該当オブジェクトを更新
      } else if (foundFbaSellerData && stockCount === null) {
        console.log("6.0.3");
        const stockCountAndDate = { todayFormatted: -100 };
        console.log("6.0.4");
        foundFbaSellerData.stockCountDatas.push(stockCountAndDate);
        console.log("6.0.5 after push", foundFbaSellerData.stockCountDatas);
      }
      console.log("6.0.6");
    },

    updateFbaSellerNOP: async (
      asinData: AsinData,
      totalFbaSeller: { value: number }
    ) => {
      asinData.fbaSellerNOP = totalFbaSeller.value;
    },

    updateTotalStock: async (
      asinData: AsinData,
      totalStock: { value: number }
    ) => {
      asinData.totalStock = totalStock.value;
    },

    updateFetchLatestDate: async (asinData: AsinData) => {
      const today = new Date();
      const todayFormatted = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      asinData.fetchLatestDate = todayFormatted;
    },

    updateFetchLatestTime: async (asinData: AsinData) => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeFormatted = `${hours}:${minutes}`;

      asinData.fetchLatestTime = currentTimeFormatted;
    },

    updateIsScarapingFalse: async (asinData: AsinData) => {
      asinData.isScraping = false;
    },

    clearCart: async (page: Page) => {
      console.log("7.0.0");
      // クッキーを削除してカート状態をリフレッシュする
      const client = await page.createCDPSession();
      await client.send("Network.clearBrowserCookies");

      console.log("7.0.1 Cart and session cleared.");
    },

    runScraping: async (
      scrape: any,
      browser: any,
      updateGlobalBrowser: (newBrowser: any) => void,
      event: Electron.IpcMainInvokeEvent,
      asinDataList: AsinData[],
      today?: Date // ? はデフォルト値の設定がないことを意味します
    ) => {
      // try-catchのリトライ用変数
      const maxRetries = 3;
      let retryCount = 0;
      // スクレイプの必要のあるasinDataのみを抽出
      const filteredAsinDataList = getFilteredAsinDataList(asinDataList);
      // 引数が渡されていない場合にのみ、todayを新たに生成
      if (!today) {
        today = new Date();
      }

      // scraperPromisの初期化（メンバ変数の宣言）部分が非同期なので
      // 同期化してからメソッド部分の非同期メソッドを各々実行
      // const scrape = await scrapePromise;
      // const browser = await scrape.launchBrowser();
      const page = await scrape.launchPage(browser);

      try {
        for (let asinData of filteredAsinDataList) {
          // 集計中のFBAセラー数の格納変数
          let totalFbaSeller = { value: 0 };
          // 集計中の合計在庫数の格納変数
          let totalStock = { value: 0 };

          await withTimeout(
            (async () => {
              // ■ 商品ページ画面の処理
              await scrape.accessProductPage(asinData, page);
              await scrape.fetchAndUpdateProductData(page, asinData);
              const hadDrawer: boolean = await scrape.checkDrawer(page);

              // ■ 出品者一覧がある場合
              if (hadDrawer) {
                await scrape.avoidPopupClick(page);
                await scrape.openSellerDrawer(page);
                await scrape.scrollOnDrawer(page);
                await scrape.fetchAndCountSellerOnDrawer(
                  page,
                  asinData,
                  totalFbaSeller
                );
                await scrape.addToCartOnDrawer(page);
                await scrape.closeDrawer(page);
                await scrape.goToCart(page);

                // ■ 出品者一覧がない場合
              } else {
                await scrape.fetchAndCountSellerOnTop(
                  page,
                  asinData,
                  totalFbaSeller
                );
                await scrape.reloadPage(page);
                await scrape.avoidPopupClick(page);
                await scrape.addToCartOnTop(page);
                await scrape.goToCart(page);
              }

              // ■ カート画面の処理
              const items = await page.$$(
                `div[data-name="Active Items"] div[data-asin="${asinData.asin}"]`
              );
              for (const item of items) {
                await scrape.avoidPopupClick(page);
                await scrape.setQuantity(page, item);
                const stockCount = await scrape.fetchStockCount(page);
                await scrape.countTotalStock(totalStock, stockCount);
                const sellerId = await scrape.fetchSellerId(page, item);
                await scrape.updateAmazonStock(asinData, stockCount, sellerId);
                await scrape.updateStockCount(
                  asinData,
                  stockCount,
                  sellerId,
                  today
                );
              }

              // asinData.fbaSellerNOPの更新
              console.log("totalFbaSeller = ", totalFbaSeller);
              await scrape.updateFbaSellerNOP(asinData, totalFbaSeller);
              // asinData.totalStockの更新
              await scrape.updateTotalStock(asinData, totalStock);
              console.log("totalStock = ", totalStock);
              // asinData.fetchLatestDateの更新
              await scrape.updateFetchLatestDate(asinData);
              // asinData.fetchLatestTimeの更新
              await scrape.updateFetchLatestTime(asinData);
              // asinData.isScrapingを更新
              await scrape.updateIsScarapingFalse(asinData);
              // Cookie削除でカートをリフレッシュ
              await scrape.clearCart(page);
              // レンダラープロセスにデータを送信
              event.sender.send("scraping-result", asinData);
            })(),
            120000,
            "Timeout"
          );
        }
        await browser.close();
        // レンダラープロセスにスクレイピング終了を知らせるデータを送信
        console.log("isEndを送信");
        event.sender.send("scraping-result", null, true);
      } catch (error: any) {
        console.log("Error message:", error.message);
        if (
          error.message.includes("Timeout") ||
          (error.message.includes("No element found") &&
            retryCount < maxRetries)
        ) {
          retryCount++;
          await sleep(3000);
          await browser.close();
          const newBrowser = await scrape.launchBrowser();
          // 他のメインプロセス関数のstopScrapingで
          // ブラウザを強制終了できるように
          // メインプロセスのグローバルスコープのbrowser変数を更新する
          updateGlobalBrowser(newBrowser);
          await scrape.runScraping(
            scrape,
            newBrowser,
            updateGlobalBrowser,
            event,
            asinDataList,
            today
          );
        } else {
          console.log("最大リトライ回数に達しました。処理を終了します。");
          await browser.close();
          const isEnd: boolean | null = true;
          console.log("isEndを送信");
          event.sender.send("scraping-result", null, true);
        }
      }
    },
  };
})();

export default scrapePromise;
