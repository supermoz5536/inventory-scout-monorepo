import React from "react";
import "./AuthedLoginSection.css";

// テスト用ハードコード
const email: string = "testadress@gmail.com";

export const AuthedLoginSection = () => {
  return (
    <>
      <h2 className="authed-login-section-h2">ログイン設定</h2>
      <div className="authed-login-section">
        <div className="authed-login-section-email">
          <p className="authed-login-section-email-text">ログイン中：</p>
          <p className="authed-login-section-email-adress">{email}</p>
        </div>
        <button className="authed-login-section-login-button">
          ログアウト
        </button>
      </div>
    </>
  );
};
