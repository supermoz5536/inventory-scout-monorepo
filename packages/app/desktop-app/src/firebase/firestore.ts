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
} from "firebase/firestore";
import { db } from "./firebase";
import { store } from "../redux/store";
import { changePlanOnStore } from "../slices/userSlice";

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
export const createUserDoc = async (uid: string, email: string) => {
  try {
    const initialData = {
      email: email,
      plan: "f",
      is_authed: false,
      is_cancel_progress: false,
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
export const setPlanFieldListener = (uid: string): any => {
  console.log("setUsersDocListener 1");
  const docRef = doc(db, "users", uid);
  console.log("setUsersDocListener 2");
  const unsubscribe: Unsubscribe = onSnapshot(docRef, (querySnapshot) => {
    console.log("setUsersDocListener 3");
    // ドキュメントが存在するか確認
    if (querySnapshot.exists()) {
      console.log("setUsersDocListener 4");
      // Stripeのhookで変更されたfirestoreのplanフィールドの変更をリスン
      const latestPlan = querySnapshot.data().plan;
      console.log("setUsersDocListener 5 latestPlan", latestPlan);
      // リスンした最新のプラン名にstoreを更新
      store.dispatch(changePlanOnStore(latestPlan));
    }
    return unsubscribe;
  });
};
