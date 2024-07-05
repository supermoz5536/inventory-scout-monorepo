import React, { useState } from "react";
import "./Setting.css";
import GuestSetting from "../components/guest/GuestSetting";
import AuthedSetting from "../components/authed/AuthedSetting";

const Setting = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // // onLogin関数の実装例
  // const handleLogin = (email) => {
  //   // 通常ここでAPIを呼び出して認証処理を行う
  //   // 認証成功後にログイン状態を更新
  //   setIsLoggedIn(true);
  //   setUserEmail(email);
  // };

  // const handleLogout = () => {
  //   setIsLoggedIn(false);
  //   setUserEmail("");
  // };

  return (
    <div>
      <h1 className="setting-h1">環境設定</h1>
      {isLoggedIn ? (
        <>
          {/* ログインしてる場合のコンポーネント読み込み */}
          <AuthedSetting />
        </>
      ) : (
        <>
          {/* ログアウトしてる場合のコンポーネント読み込み */}
          <GuestSetting />
        </>
      )}
    </div>
  );
};

export default Setting;
