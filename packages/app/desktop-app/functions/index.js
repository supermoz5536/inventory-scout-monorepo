// Axiosライブラリをインポート（HTTPリクエストを行うために使用）
const axios = require("axios");
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
      const db = getFirestoreRef();
      // リクエストボディからイベントデータを取得し、
      const event = request.body;
      // StripeのCustomer ID
      const customerId = event.data.object.customer;
      // StripeからCustomerオブジェクトを取得
      const customer = await stripe.customers.retrieve(customerId);
      // CustomerのmetadataからFirebase UIDを取得
      const firebaseUid = customer.metadata.firebaseUid;

      switch (event.type) {
        // premiumプラン契約時の処理
        case "customer.subscription.created": {
          await db.collection("user").doc(firebaseUid).update({
            subscription_plan: "premium",
          });
          response.json({ received: true });
          break;
        }
        // premiumプラン解約時の処理
        case "customer.subscription.deleted": {
          await db.collection("user").doc(firebaseUid).update({
            subscription_plan: "free",
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
        return { success: false, message: "already_canceled" };
      } else {
        // 現在はpremiumプランしかアイテムはなく、
        // 契約時に重複登録は弾いているので[0]番目を指定
        await stripe.subscriptions.update(subscriptions.data[0].id, {
          cancel_at_period_end: true,
        });
        // 成功した場合のレスポンス
        return { success: true, message: "canceled" };
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
            // Stripeで事前に設定したプライスIDを指定します。
            price: "price_1PmQbp02YGIp0FEBkbB6siUQ",
            // 購入数量を1に設定します。
            quantity: 1,
          },
        ],
        // このセッションのモードを「支払い」に設定します。
        mode: "subscription",
        // 支払いが成功した際にリダイレクトするURLを指定します。
        success_url: "https://www.google.co.jp/",
        // 支払いがキャンセルされた際にリダイレクトするURLを指定します。
        cancel_url: "https://www.google.co.jp/",
      });
      return session.id;
    } catch (error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  });
