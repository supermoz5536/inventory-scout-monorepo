// from "firebase/firestore"は
// Firebaseの公式SDKから
// Firestore関連の機能を
// インポートするためのモジュールパスです。
import {
  collection,
  getDocs,
  DocumentData,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  updateDoc,
  getDocFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import { store } from "../redux/store";
import {
  changeIsLockedRunScraping,
  changePlanOnStore,
} from "../slices/userSlice";
import { changeSessionIdOnServer } from "../slices/systemStatusSlice";

export const getFirstUserEmail = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));

    if (querySnapshot) {
      return querySnapshot.docs[0].data()["email"];
    }
  } catch (error) {
    console.log("getFirstUserEmail(): failed");
  }
};

export const getUserDoc = async (
  uid: string,
): Promise<DocumentData | undefined> => {
  const docRef = doc(db, "users", uid);

  // getDoc(): 引数で指定した参照の
  // ドキュメントスナップショットのオブジェクトを取得
  const docSnapShot = await getDoc(docRef);

  try {
    if (docSnapShot.exists()) return docSnapShot.data();
  } catch (error) {
    console.log("getUserDoc(): error", error);
    throw error;
  }
};

// Firestoreにドキュメントを作成する関数
export const createUserDoc = async (
  uid: string,
  email: string,
  sessionId: string,
) => {
  try {
    const initialData = {
      email: email,
      // 有償化コメントアウト 有償化サービスが開始したら
      // 「plan: s」→「plan: f」
      // に変更する必要があります。
      plan: "s",
      is_authed: false,
      is_cancel_progress: false,
      is_locked_run_scraping: true,
      session_id: sessionId,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", uid), initialData);
    console.log("Firestoreへのユーザーデータドキュメントの作成が成功");
  } catch (error) {
    console.error(
      "Firestoreへのユーザーデータドキュメントの作成時にエラーが発生:",
      error,
    );
  }
};

// usersコレクションのuidの一致するドキュメントの変更を取得するリスナーの設置関数
export const setUserDocListener = (uid: string): any => {
  const docRef = doc(db, "users", uid);
  const unsubscribe: Unsubscribe = onSnapshot(docRef, (querySnapshot) => {
    // ドキュメントが存在するか確認
    if (querySnapshot.exists()) {
      // Stripeのhookで変更されたfirestoreのplanフィールドの変更をリスン
      const latestPlan = querySnapshot.data().plan;
      // フリープランの機能制限のハンドリング値の変更をリスン
      const latestIsLockedRunScraping =
        querySnapshot.data().is_locked_run_scraping;
      // サーバーのセッションIDの値の変更をリスン
      const latestSessionIdOnServer = querySnapshot.data().session_id;
      // リスンした最新のプラン名にstoreを更新
      store.dispatch(changePlanOnStore(latestPlan));
      store.dispatch(changeIsLockedRunScraping(latestIsLockedRunScraping));
      store.dispatch(changeSessionIdOnServer(latestSessionIdOnServer));
    }
    return unsubscribe;
  });
};

export const updateEmailOnFirestore = async (uid: string, email: string) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      email: email,
    });
  } catch (e) {
    console.log("updateEmailOnFirestore エラー：", e);
  }
};

export const updateSessionIdOnFirestore = async (
  uid: string,
  sessionId: string,
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      session_id: sessionId,
    });
  } catch (e) {
    console.log("updateSessionIdOnFirestore エラー：", e);
  }
};

export const fetchSessionIdOnFirestore = async (
  uid: string,
): Promise<string | undefined> => {
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDocFromServer(userDocRef);

    if (docSnap.exists()) {
      const sessionId = docSnap.data().session_id;
      return sessionId;
    }
  } catch (e) {
    console.log("fetchSessionId エラー：", e);
  }
};
