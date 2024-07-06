import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// 必要な関数の機能
// inputで入力された
// eamilとpasswordのテキスト情報を変数に格納し
// signInWithEmailAndPasswordメソッドに渡す。
// サインインが成功したら、
// 状態変数のisLoggedInをtrueに更新する

const logInAndUpdateUser = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // ■■■■■■■ 状態変数のisLoggedInをtrueに更新する ■■■■■■■■
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
};
