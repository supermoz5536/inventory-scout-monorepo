import { auth } from "./firebase";
import { UserCredential, signInWithEmailAndPassword } from "firebase/auth";

// 必要な関数の機能
// inputで入力された
// eamilとpasswordのテキスト情報を変数に格納し
// signInWithEmailAndPasswordメソッドに渡す。
// サインインが成功したら、
// 状態変数のisLoggedInをtrueに更新する

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
