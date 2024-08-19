import React from "react";
import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

// 月額プランの購入プロセスのハンドル関数です。
// チェックアウトセッション作成とリダイレクトを行います。
export const callCreateCheckoutSession = async (
  uid: string,
  appURL: string,
  plan: string,
) => {
  try {
    // 第１引数としてfunctionsを渡すことで、
    // どのFirebaseプロジェクトのクラウド関数を呼び出すかを指定します。
    const createCheckoutSession = httpsCallable(
      functions,
      "createCheckoutSession",
    );
    const result: any = await createCheckoutSession({
      uid: uid,
      appURL: appURL,
      plan: plan,
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
    const updateCancelAtPeriodEnd = httpsCallable(
      functions,
      "updateCancelAtPeriodEnd",
    );
    const result: any = await updateCancelAtPeriodEnd({
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

// 月額プランの当月分の期末日を取得する関数
export const callFetchPeriodEndDate = async (uid: string) => {
  try {
    const fetchPeriodEndDate = httpsCallable(functions, "fetchPeriodEndDate");
    const result: any = await fetchPeriodEndDate({
      uid: uid,
    });
    // レスポンスデータから'message'キーに対応する値を取得
    // 以下のいずれかのメッセージ
    // "canceled" : キャンセル処理が成功
    // "already_canceled" : 既にキャンセル済み
    const periodEndDate = result.data["periodEndDate"];

    return periodEndDate;
  } catch (e: any) {
    // Firebase Functions からのエラーをキャッチ
    console.log(`callFetchPeriodEndDate エラーコード: ${e.code}`);
    console.log(`callFetchPeriodEndDate エラーメッセージ: ${e.message}`);
    console.log(`callFetchPeriodEndDate 詳細: ${e.details}`);
  }
};
