import React from "react";
import { createAuthAccount } from "../firebase/authentication";
import { createUserDoc } from "../firebase/firestore";
import { store } from "../redux/store";
import { changeUidOnStore, updateUser } from "../slices/userSlice";

export const createAccount = async (email: string, password: string) => {
  // Authenticationにアカウント作成
  const result = await createAuthAccount(email, password);
  if (result.success) {
    // Firestoreにアカウント情報の管理ドキュメント作成
    // .suucess === trueの場合は、.bodyにuidが格納されている
    await createUserDoc(result.body, email);
    // 作成したuidにStoreを更新
    store.dispatch(
      updateUser({
        uid: result.body,
        email: email,
        password: password,
        isAuthed: true,
        isAutoLogIn: false,
        is_cancel_progress: false,
        plan: "f",
        createdAt: "",
      }),
    );
    return true;
  } else {
    // .suucess === falseの場合は、.bodyにエラーコードが格納されている
    return result.body;
  }
};
