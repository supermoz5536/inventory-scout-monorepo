import React from "react";
import { createAuthAccount } from "../firebase/authentication";
import { createUserDoc } from "../firebase/firestore";
import { store } from "../redux/store";
import { changeUidOnStore } from "../slices/userSlice";

export const createAccount = async (email: string, password: string) => {
  // Authenticationにアカウント作成
  const uid: string | undefined = await createAuthAccount(email, password);
  if (uid) {
    // Firestoreにアカウント情報の管理ドキュメント作成
    await createUserDoc(uid, email);
    // 作成したuidにStoreを更新
    store.dispatch(changeUidOnStore(uid));
  } else {
    console.log("createAuthAccount関数で返り値のuidを取得できませんでした");
  }
};
