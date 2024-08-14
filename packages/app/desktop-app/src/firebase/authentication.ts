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
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  changeIsAuthed,
  changeEmailOnStore,
  changePasswordOnStore,
} from "../slices/userSlice";

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
      console.log("listenAuthState changeIsAuthed(true)");
      store.dispatch(changeIsAuthed(true));
    } else {
      // ログアウト状態の場合
      console.log("listenAuthState changeIsAuthed(false)");
      store.dispatch(changeIsAuthed(false));
    }
  });
  return unsubscribe;
};

export const initLogoutCallBack = async () => {
  console.log("initLogoutCallBackがトリガーされました");
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
      store.dispatch(changeEmailOnStore(newEmail));
      console.log("メールアドレスの更新に成功しました");
      return "e0";
    } else {
      throw new Error("サインインしているユーザーがいません");
    }
  } catch (e: any) {
    console.log("updateEmail( ): e.message", e.code.message);

    if (e.code == "auth/invalid-email") {
      console.log("updateEmail( ): failed e0", e.code);
      // 無効なメールアドレスです
      return "e1";
    } else if (e.code == "auth/user-not-found") {
      console.log("updateEmail( ): failed e1", e.code);
      // メールアドレスが見つかりません。
      return "e2";
    } else if (e.code == "auth/user-disabled") {
      console.log("updateEmail( ): failed e2", e.code);
      // このユーザーは無効化されています。
      return "e3";
    } else if (e.code == "auth/network-request-failed") {
      console.log("updateEmail( ): failed e3", e.code);
      // ネットワークエラーが発生しました。
      return "e4";
    } else {
      console.log("updateEmail( ): failed", e.code);
    }
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
      store.dispatch(changeEmailOnStore(newPassword));
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

export const createAuthAccount = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (userCredential) {
      // Signed in
      return userCredential.user.uid;
    }
  } catch (error: any) {
    console.log("errorCode", error.code);
    console.log("errorMessage", error.message);
  }
};
