// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require("firebase-functions");
// 決済ページの用意とリダイレクトを行うStripeのライブラリ
const Stripe = require("stripe");
// The Firebase Admin SDK to access Firestore.
// firestoreの参照を取得する関数のimport
const { initializeApp } = require("firebase-admin/app");
const { getFirestore: getFirestoreRef } = require("firebase-admin/firestore");

initializeApp(); //
// initializeApp()関数が呼び出され
// Firebase Admin SDKの初期化がされた時に
// Firestoreのインスタンスが作成され
// メモリにロード（格納）される

exports.fetchPeriodEndDate = functions
  .runWith({
    memory: "512MB", // メモリの割り当てを増やす
  })
  .https.onCall(async (data, context) => {
    try {
      const stripe = new Stripe(process.env.STRIPE_API_KEY, {
        apiVersion: "2023-10-16",
      });
      let activeSubscription = null;
      const firebaseUid = data.uid;

      // Firebase UIDを使用して顧客を検索
      // (customerIdだと、セッション間で紐付けできない)
      const customers = await stripe.customers.search({
        query: `metadata['firebaseUid']:'${firebaseUid}'`,
        limit: 100, // 1回のリクエストで最大100件まで取得
      });

      if (customers.data.length === 0) {
        throw new functions.https.HttpsError("not-found", "No customer found");
      }

      // avtiveなサブスクリプションプランを保持してる顧客を探す
      // (一人が複数のcustomerIdを生成している場合があるので、
      // 共通のFiresbaseUidでフィルタして抽出したIdで振るいにかけている)
      for (const customer of customers.data) {
        // 任意の顧客のサブスクリプションプランのリストを取得
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: "active",
        });

        // リストの中身がある顧客を見つけたら
        // その中身のactiveなプランに更新してbreak
        if (subscriptions.data.length > 0) {
          activeSubscription = subscriptions.data[0];
          break;
        }
      }

      // リストの中身がある顧客を見つけられなかった場合のハンドリング
      if (activeSubscription === null) {
        throw new functions.https.HttpsError(
          "not-found",
          "No activeSubscription found",
        );
      }

      // サブスクリプションの現在の期間の終了日を取得
      const periodEnd = activeSubscription.current_period_end;

      // UNIXタイムスタンプを人間が読みやすい形式に変換
      const periodEndDate = new Date(periodEnd * 1000).toLocaleString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      console.log("■■■■■ periodEndDate", periodEndDate);

      // 成功した場合のレスポンス
      return {
        success: true,
        periodEndDate: periodEndDate,
      };
    } catch (error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

// StripeからのWebhookリクエストを受け取る関数です
exports.stripeWebhook = functions
  .runWith({
    memory: "512MB", // メモリの割り当てを増やす
  })
  .https.onRequest(async (request, response) => {
    try {
      // Stripeオブジェクトを新規作成し、Stripe APIを利用するためのシークレットキーとAPIのバージョンを指定します。
      const stripe = new Stripe(process.env.STRIPE_API_KEY, {
        apiVersion: "2023-10-16",
      });

      // Firestoreのインスタンスの参照を取得
      // リクエストボディからイベントデータを取得
      const db = getFirestoreRef();
      const event = request.body;

      switch (event.type) {
        // セッション画面で決済が正常に完了した時のコールバック
        case "checkout.session.completed": {
          const session = event.data.object;
          const customerId = event.data.object.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const firebaseUid = customer.metadata.firebaseUid;

          if (session.mode === "subscription") {
            // 月額プランにフラグ変更
            await db.collection("users").doc(firebaseUid).update({
              plan: "s",
            });
          } else if (session.mode === "payment") {
            // ① 月額プランを即時キャンセル

            // Firebase UIDを使用して顧客を検索
            // (customerIdだと、セッション間で紐付けできない)
            let activeSubscription = null;
            const customers = await stripe.customers.search({
              query: `metadata['firebaseUid']:'${firebaseUid}'`,
              limit: 100, // 1回のリクエストで最大100件まで取得
            });

            if (customers.data.length === 0) {
              throw new functions.https.HttpsError(
                "not-found",
                "No customer found",
              );
            }

            // avtiveなサブスクリプションプランを保持してる顧客を探す
            // (一人が複数のcustomerIdを生成している場合があるので、
            // 共通のFiresbaseUidでフィルタして抽出したIdで振るいにかけている)
            for (const customer of customers.data) {
              // 任意の顧客のサブスクリプションプランのリストを取得
              const subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: "active",
              });

              // リストの中身がある顧客を見つけたら
              // その中身のactiveなプランに更新してbreak
              if (subscriptions.data.length > 0) {
                activeSubscription = subscriptions.data[0];
                break;
              }
            }

            if (activeSubscription === null) {
              throw new functions.https.HttpsError(
                "not-found",
                "No activeSubscription found",
              );
            }

            // キャンセル前にFirestoreのフラグをON
            await db.collection("users").doc(firebaseUid).update({
              is_cancel_progress: true,
            });

            // サブスクリプションを即時にキャンセルする
            // 残りの未使用の期間分の返金はされない。
            await stripe.subscriptions.cancel(activeSubscription.id, {
              invoice_now: true, // 未請求の使用量や新規/保留中の割合請求アイテムを請求する最終請求書を生成します
              prorate: true, // サブスクリプション期間終了までの残りの未使用時間をクレジットする比例請求アイテムを生成します
            });

            await db.collection("users").doc(firebaseUid).update({
              plan: "p",
            });

            // 額プラン解約時の case で
            // 確実にフラグを get してスキップさせるように待機
            await new Promise((resolve) => setTimeout(resolve, 10000));

            // キャンセル後にFirestoreのフラグをOFF
            await db.collection("users").doc(firebaseUid).update({
              is_cancel_progress: false,
            });
          }

          response.json({ received: true });
          break;
        }

        // 月額プラン解約時の処理
        case "customer.subscription.deleted": {
          const customerId = event.data.object.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const firebaseUid = customer.metadata.firebaseUid;

          // Firestoreのフラグをチェック
          const userDoc = await db.collection("users").doc(firebaseUid).get();
          if (userDoc.exists && userDoc.data()["is_cancel_progress"]) {
            // 買い切りプラン購入による cancel なら処理をスキップ
            response.json({ received: true });
            return;
          }

          await db.collection("users").doc(firebaseUid).update({
            plan: "f",
          });
          response.json({ received: true });
          break;
        }

        default: {
          response.status(400).end();
          break;
        }
      }
    } catch (error) {
      // Cloud Functionsへのコンソール表示用ログ
      console.error("Error handling webhook:", error);
      // クライアントへのレスポンス:
      // StripeのWebhookを送信してきたシステムや、
      // APIを叩いている他のクライアント
      response.status(500).send("Internal Server Error");
    }
  });

exports.updateCancelAtPeriodEnd = functions
  .runWith({
    memory: "512MB", // メモリの割り当てを増やす
  })
  .https.onCall(async (data, context) => {
    try {
      const stripe = new Stripe(process.env.STRIPE_API_KEY, {
        apiVersion: "2023-10-16",
      });

      const firebaseUid = data.uid;
      // StripeのCustomerをメタデータのFirebase UIDで検索
      const customers = await stripe.customers.search({
        query: `metadata['firebaseUid']:'${firebaseUid}'`,
      });

      if (customers.data.length === 0) {
        throw new functions.https.HttpsError("not-found", "not found");
      }

      const customerId = customers.data[0].id;

      // 顧客に紐づくアクティブなサブスクリプションリストを取得する
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
      });

      if (subscriptions.data[0].cancel_at_period_end) {
        // すでに解約処理がされている場合
        return {
          success: false,
          message: "already_canceled",
          cancelAt: subscriptions.data[0].current_period_end,
        };
      } else {
        // 現在はpremiumプランしかアイテムはなく、
        // 契約時に重複登録は弾いているので[0]番目を指定
        await stripe.subscriptions.update(subscriptions.data[0].id, {
          cancel_at_period_end: true,
        });
        // 成功した場合のレスポンス
        return {
          success: true,
          message: "canceled",
          cancelAt: subscriptions.data[0].current_period_end,
        };
      }
    } catch (error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

exports.createCheckoutSession = functions
  .runWith({
    memory: "512MB", // メモリの割り当てを増やす
  })
  .https.onCall(async (data) => {
    try {
      // Stripeオブジェクトを新規作成し、Stripe APIを利用するためのシークレットキーとAPIのバージョンを指定します。
      const stripe = new Stripe(process.env.STRIPE_API_KEY, {
        apiVersion: "2023-10-16",
      });
      // dataからmyUidを取得
      const firebaseUid = data.uid;
      // Stripeの顧客を新規作成し、その結果をcustomer変数に格納します。
      const customer = await stripe.customers.create({
        // myUidをメタデータとして設定
        metadata: { firebaseUid: firebaseUid },
      });

      // 選択されたプラン名と一致するように
      // Stripeで事前に設定したプライスIDを指定します。
      const priceId =
        data.plan === "s"
          ? "price_1PncjR02YGIp0FEB0XHuZQaZ"
          : data.plan === "p"
          ? "price_1Pp2ca02YGIp0FEBZyRU9N2B"
          : null;

      // プライスIDがnullの場合のエラーハンドリング
      if (!priceId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "priceId is null",
        );
      }

      // 商品がサブスクか一括払いかで決済モードを切り替えます。
      const paymentMode =
        data.plan === "s"
          ? "subscription"
          : data.plan === "p"
          ? "payment"
          : null;

      // 決済モードがnullの場合のエラーハンドリング
      if (!paymentMode) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "paymentMode is null",
        );
      }

      // StripeのCheckoutセッションを新規作成し、その設定を行います。
      const session = await stripe.checkout.sessions.create({
        // 作成した顧客のIDをセッションに紐付けます。
        customer: customer.id,
        // 支払い方法として「カード」と「顧客の残高」を指定します。
        payment_method_types: ["card"],
        // 支払い方法のオプションを指定します。
        payment_method_options: {
          // 顧客の残高に関する設定を行います。
          customer_balance: {
            // 資金の種類として「銀行振込」を指定します。
            funding_type: "bank_transfer",
            // 銀行振込に関する設定を行います。
            bank_transfer: {
              // 日本の銀行振込を指定します。
              type: "jp_bank_transfer",
            },
          },
        },
        // 請求項目の設定を開始します。
        line_items: [
          {
            // 選択されたプラン名と一致するように
            // Stripeで事前に設定したプライスIDを指定します。
            price: priceId,
            // 購入数量を1に設定します。
            quantity: 1,
          },
        ],
        // このセッションのモードを「支払い」に設定します。
        mode: paymentMode,
        // 支払いが成功した際にリダイレクトするURLを指定します。
        success_url: data.appURL,
        // 支払いがキャンセルされた際にリダイレクトするURLを指定します。
        cancel_url: data.appURL,
      });
      return session.id;
    } catch (error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  });
