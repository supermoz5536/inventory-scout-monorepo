import { store } from "../redux/store";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { changeIsAuthed, changeEmail } from "../slices/userSlice";

/// emailとpasswordでログイン処理を行い
/// 成功した場合は、ユーザーデータを格納した
/// credentialオブジェクトを返します。
export const logInWithEmailAndPassword = async (
  email: string,
  password: string
) => {
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
  } catch (e: any) {
    console.log("logInWithEmailAndPassword( ): e.message", e.code.message);

    if (e.code == "auth/invalid-email") {
      console.log("logInWithEmailAndPassword( ): failed e0", e.code);
      // 無効なメールアドレスです
      return "e0";
    } else if (e.code == "auth/user-not-found") {
      console.log("logInWithEmailAndPassword( ): failed e1", e.code);
      // メールアドレスが見つかりません。
      return "e1";
    } else if (e.code == "auth/wrong-password") {
      console.log("logInWithEmailAndPassword( ): failed e2", e.code);
      // パスワードが間違っています。
      return "e2";
    } else if (e.code == "auth/invalid-credential") {
      console.log("logInWithEmailAndPassword( ): failed e3", e.code);
      // ログイン情報に誤りがあります。
      return "e3";
    } else if (e.code == "auth/too-many-requests") {
      console.log("logInWithEmailAndPassword( ): failed e4", e.code);
      // ログインの試行回数が多すぎます。少し時間をおいてからもう一度お試しください
      return "e4";
    } else {
      console.log("logInWithEmailAndPassword( ): failed", e.code);
    }
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

/// サーバーの認証状態の変更を取得するリスナーを設置します
export const listenAuthState = async () => {
  const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
    // ログイン状態の場合
    if (user) {
      store.dispatch(changeIsAuthed(true));
    } else {
      // ログアウト状態の場合
      store.dispatch(changeIsAuthed(false));
    }
  });
  return unsubscribe;
};

export const initLogoutCallBack = async () => {
  try {
    await signOut(auth);
    store.dispatch(changeIsAuthed(false));
    console.log("Logged out successfully");
  } catch (error) {
    console.error("Failed to log out:", error);
  }
};

// メールアドレスを更新する関数
export const changeEmailAdress = async (
  newEmail: string,
  currentPassword: string
) => {
  try {
    const user = auth.currentUser;
    if (user) {
      // ユーザーを再認証する
      const credential = EmailAuthProvider.credential(
        user.email as string,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // メールアドレスを更新する
      await updateEmail(user, newEmail);
      store.dispatch(changeEmail(newEmail));
      console.log("メールアドレスの更新に成功しました");
      return true;
    } else {
      throw new Error("サインインしているユーザーがいません");
    }
  } catch (error) {
    console.error("メールアドレスの更新に失敗しました:", error);
    return false;
  }
};

// パスワードを更新する関数
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    const user = auth.currentUser;
    if (user) {
      // ユーザーを再認証する
      const credential = EmailAuthProvider.credential(
        user.email as string,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // パスワードを更新する
      await updatePassword(user, newPassword);
      console.log("パスワードの更新に成功しました");
      return true;
    } else {
      throw new Error("サインインしているユーザーがいません");
    }
  } catch (error) {
    console.error("パスワードの更新に失敗しました:", error);
    return false;
  }
};
