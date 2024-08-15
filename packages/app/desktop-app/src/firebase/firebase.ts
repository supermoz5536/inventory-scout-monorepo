// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDiTfLaMmthJxUrhPCsTI_eGgUQqmipQtU",
  authDomain: "inventory-scout-ja.firebaseapp.com",
  projectId: "inventory-scout-ja",
  storageBucket: "inventory-scout-ja.appspot.com",
  messagingSenderId: "671258679184",
  appId: "1:671258679184:web:81d69be92d7445c5e84515",
  measurementId: "G-LRZNYREKY9",
};

// Initialize Firebase
// appは、Firebaseアプリケーション全体の参照を持つ
// シングルトンのインスタンスです。
// このappインスタンスを通して、Firebaseの各サービスにアクセスします。
const app = initializeApp(firebaseConfig);

// Firebaseの各種サービスの「参照」を持つ
// シングルトンのインスタンスです。
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, analytics, auth, functions };
