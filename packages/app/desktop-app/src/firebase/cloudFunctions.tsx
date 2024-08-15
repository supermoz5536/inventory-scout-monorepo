import React from "react";
import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

export const callCreateCheckoutSession = async (uid: string) => {
  try {
    // 第１引数としてfunctionsを渡すことで、
    // どのFirebaseプロジェクトのクラウド関数を呼び出すかを指定します。
    const createCheckoutSession = httpsCallable(
      functions,
      "createCheckoutSession"
    );
    const result: any = await createCheckoutSession({ uid: uid });
    // チェックアウトセッション画面へのリダイレクトに必要な情報を返す
    return result.data;
  } catch (e: any) {
    // Firebase Functions からのエラーをキャッチ
    console.log(`callCreateCheckoutSession エラーコード: ${e.code}`);
    console.log(`callCreateCheckoutSession エラーメッセージ: ${e.message}`);
    console.log(`callCreateCheckoutSession 詳細: ${e.details}`);
  }
};
