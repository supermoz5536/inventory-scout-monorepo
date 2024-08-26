import React from "react";
import { createAuthAccount } from "../firebase/authentication";
import { createUserDoc } from "../firebase/firestore";
import { store } from "../redux/store";
import { changeUidOnStore, updateUser } from "../slices/userSlice";
import { v4 as uuidv4 } from "uuid";

export const createAccount = async (email: string, password: string) => {
  // Authenticationにアカウント作成
  const result = await createAuthAccount(email, password);
  if (result.success) {
    // Firestoreにアカウント情報の管理ドキュメント作成
    // .suucess === trueの場合は、.bodyにuidが格納されている
    const sessionId: string = uuidv4();
    await createUserDoc(result.body, email, sessionId);
    // 作成したuidにStoreを更新
    store.dispatch(
      updateUser({
        uid: result.body,
        email: email,
        password: password,
        isAuthed: true,
        isAutoLogIn: false,
        isCancelProgress: false,
        isLockedRunScraping: true,
        plan: "f",
        sessionId: sessionId,
        createdAt: "",
      }),
    );
    return true;
  } else {
    // .suucess === falseの場合は、.bodyにエラーコードが格納されている
    return result.body;
  }
};
