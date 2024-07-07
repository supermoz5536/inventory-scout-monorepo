import React, { useEffect, useRef, useState } from "react";
import "./GuestLoginSection.css";
import { logInWithEmailAndPassword } from "../../firebase/authentication";
import { getUserDoc } from "../../firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/userSlice";
import { DocumentData } from "firebase/firestore";

const GuestLoginSection = () => {
  let isAutoLogIn: boolean = false;
  const dispatch = useDispatch<AppDispatch>();

  // パスワード表示制御ようのstate
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);

  // グローバル変数のuserの参照を定数で定義
  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // メールアドレス入力時のUI即時反映
  const [inputEmail, setInputEmail] = useState<string>("");
  const handleInputEmailChange = (event: any) => {
    setInputEmail(event.target.value);
  };

  // パスワード入力時のUI即時反映
  const [inputPassword, setInputPassword] = useState<string>("");
  const handleInputPasswordChange = (event: any) => {
    setInputPassword(event.target.value);
  };

  // ログインボタンのコールバック
  const handleLogIn = async (inputEmail: string, inputPassword: string) => {
    const userCredential = await logInWithEmailAndPassword(
      inputEmail,
      inputPassword
    );
    if (userCredential) {
      // ■ userCredential.user.uid と一致するドキュメントが存在しない場合
      // インフォトップ決済の仕様においては、手動でFirestoreのDocの作成が必要

      // ■ userCredential.user.uid と一致するドキュメントが存在する場合
      // firestoreからドキュメントデータを取得
      // プラン名とアカウント作成日を取得し、割り当てる
      const userDocData: DocumentData | undefined = await getUserDoc(
        userCredential.user.uid
      );

      if (userDocData) {
        // 最新のUserオブジェクトを生成
        const newUser: User = {
          uid: userCredential.user.uid,
          email: inputEmail,
          password: inputPassword,
          isAuthed: true,
          isAutoLogIn: isAutoLogIn,
          plan: userDocData["plan"] ?? "not found",
          createdAt: userDocData["created_at"] ?? "not found",
        };

        // ストアのUserオブジェクトを更新
        dispatch(updateUser(newUser));

        // ローカルストレージのuserDataを更新
        await window.myAPI.saveUser(userRef.current);
      }
    }
  };

  return (
    <>
      <h2 className="guest-login-section-h2">ログイン設定</h2>
      <div className="guest-login-section">
        <div className="guest-login-section-email">
          <p>メールアドレス：</p>
          <input value={inputEmail} onChange={handleInputEmailChange}></input>
        </div>
        <div className="guest-login-section-password">
          <p>パスワード：</p>
          <input
            placeholder="Password"
            type={isVisiblePassword ? "text" : "password"}
            value={inputPassword}
            onChange={handleInputPasswordChange}
          ></input>
        </div>
        <button
          className="guest-login-section-login-button"
          onClick={() => {
            handleLogIn(inputEmail, inputPassword);
          }}
        >
          ログイン
        </button>
        <div className="guest-login-section-auto-login">
          <input type="checkbox" onChange={(event) => {}} />
          <p>次回から自動でログインする</p>
        </div>
      </div>
    </>
  );
};

export default GuestLoginSection;
