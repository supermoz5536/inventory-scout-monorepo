import React from "react";
import "./GuestLoginSection.css";

const GuestLoginSection = () => {
  return (
    <>
      <h2 className="guest-login-section-h2">ログイン設定</h2>
      <div className="guest-login-section">
        <div className="guest-login-section-email">
          <p>メールアドレス：</p>
          <input></input>
        </div>
        <div className="guest-login-section-password">
          <p>パスワード：</p>
          <input></input>
        </div>
        <button className="guest-login-section-login-button">ログイン</button>
        <div className="guest-login-section-auto-login">
          <input type="checkbox" onChange={(event) => {}} />
          <p>次回から自動でログインする</p>
        </div>
      </div>
    </>
  );
};

export default GuestLoginSection;
