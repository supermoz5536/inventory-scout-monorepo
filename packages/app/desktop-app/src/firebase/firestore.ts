// from "firebase/firestore"は
// Firebaseの公式SDKから
// Firestore関連の機能を
// インポートするためのモジュールパスです。
import { collection, getDocs } from "firebase/firestore";
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
