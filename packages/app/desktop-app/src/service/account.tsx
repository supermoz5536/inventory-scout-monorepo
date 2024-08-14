import React from "react";
import { createAuthAccount } from "../firebase/authentication";
import { createUserDoc } from "../firebase/firestore";

export const createAccount = async (email: string, password: string) => {
  const uid: string | undefined = await createAuthAccount(email, password);
  if (uid) {
    createUserDoc(uid, email);
  } else {
    console.log("createAuthAccount関数で返り値のuidを取得できませんでした");
  }
};
