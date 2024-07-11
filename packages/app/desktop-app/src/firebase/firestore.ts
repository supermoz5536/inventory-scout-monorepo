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
} from "firebase/firestore";
import { db } from "./firebase";

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
  uid: string
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
