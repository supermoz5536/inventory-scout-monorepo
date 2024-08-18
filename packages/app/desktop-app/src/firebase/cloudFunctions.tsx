import React from "react";
import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

export const callCreateCheckoutSession = async (
  uid: string,
  appURL: string
) => {
  console.log("appURL", appURL);
  try {
    // 第１引数としてfunctionsを渡すことで、
    // どのFirebaseプロジェクトのクラウド関数を呼び出すかを指定します。
    const createCheckoutSession = httpsCallable(
      functions,
      "createCheckoutSession"
    );
    const result: any = await createCheckoutSession({
      uid: uid,
      appURL: appURL,
    });
    // チェックアウトセッション画面へのリダイレクトに必要な情報を返す
    return result.data;
  } catch (e: any) {
    // Firebase Functions からのエラーをキャッチ
    console.log(`callCreateCheckoutSession エラーコード: ${e.code}`);
    console.log(`callCreateCheckoutSession エラーメッセージ: ${e.message}`);
    console.log(`callCreateCheckoutSession 詳細: ${e.details}`);
  }
};

// 月額プランの自動解約処理の予約を行う関数
// 処理した月の月末に自動で解約される
export const callUpdateCancelAtPeriodEnd = async (uid: string) => {
  try {
    const createCheckoutSession = httpsCallable(
      functions,
      "updateCancelAtPeriodEnd"
    );
    const result: any = await createCheckoutSession({
      uid: uid,
    });
    // レスポンスデータから'message'キーに対応する値を取得
    // 以下のいずれかのメッセージ
    // "canceled" : キャンセル処理が成功
    // "already_canceled" : 既にキャンセル済み
    const message = result.data["message"];
    const cancelAt = result.data["cancelAt"];
    return { message, cancelAt };
  } catch (e: any) {
    // Firebase Functions からのエラーをキャッチ
    console.log(`callUpdateCancelAtPeriodEnd エラーコード: ${e.code}`);
    console.log(`callUpdateCancelAtPeriodEnd エラーメッセージ: ${e.message}`);
    console.log(`callUpdateCancelAtPeriodEnd 詳細: ${e.details}`);
  }
};
