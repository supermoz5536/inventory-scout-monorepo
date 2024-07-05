import React, { useState } from "react";
import "./Setting.css";

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
      <h1>設定</h1>
      {isLoggedIn ? (
        <>
          {/* ログイン設定のコンポーネント */}
          {/* アカウント設定のコンポーネント */}
          {/* 定期スクレイピング設定のコンポーネント */}
        </>
      ) : (
        <>
          {/* ログイン設定のコンポーネント */}
          {/* アカウント設定のコンポーネント */}
          {/* 定期スクレイピング設定のコンポーネント */}
        </>
      )}
    </div>
  );
};

export default Setting;
