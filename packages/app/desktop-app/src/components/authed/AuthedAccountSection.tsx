import React from "react";
import "./AuthedAccountSection.css";
import { useSelector } from "react-redux";

const AuthedEmailSection = () => {
  const user: User = useSelector((state: RootState) => state.user.value);

  return (
    <>
      <h2 className="authed-account-section-h2">アカウント設定</h2>
      <div className="authed-account-section">
        <div className="authed-account-section-email">
          {/* メールセクション */}
          <p>メールアドレスの変更</p>
          <div className="authed-account-section-email-item">
            <p>現在のメールアドレス：</p>
            <p className="authed-account-section-email-item-value">
              {user.email}
            </p>
          </div>
          <div className="authed-account-section-email-item">
            <p>新しいメールアドレス：</p>
            <input className="authed-account-section-email-item-value"></input>
          </div>
          <button>変更</button>
        </div>
        {/* パスワードセクション */}
        <div className="authed-account-section-password">
          <p>パスワードの変更</p>
          <div className="authed-account-section-password-item">
            <p>現在のパスワード：</p>
            <input></input>
          </div>
          <div className="authed-account-section-password-item">
            <p>新しいパスワード：</p>
            <input></input>
          </div>
          <div className="authed-account-section-password-item">
            <p>パスワードの確認：</p>
            <input></input>
          </div>
          <button>変更</button>
        </div>
      </div>
    </>
  );
};

export default AuthedEmailSection;
