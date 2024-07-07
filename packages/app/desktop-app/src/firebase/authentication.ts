import { auth } from "./firebase";
import {
  UserCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

/// emailとpasswordでログイン処理を行い
/// 成功した場合は、ユーザーデータを格納した
/// credentialオブジェクトを返します。
export const logInWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    // signInWithEmailAndPassword は
    // ログイン成功時のみ
    // UserCredential オブジェクトを返します。
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error: any) {
    console.log("signInWithEmailAndPassword: failed error.code", error.code);
    console.log("signInWithEmailAndPassword: failed error.code", error.message);
    throw error;
  }
};

export const logOut = async (): Promise<boolean> => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.log("logOut() failed:", error);
    return false;
  }
};
