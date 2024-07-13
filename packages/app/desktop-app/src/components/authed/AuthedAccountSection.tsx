import React, { useState } from "react";
import "./AuthedAccountSection.css";
import { useSelector } from "react-redux";
import { changeEmailAdress } from "../../firebase/authentication";

const AuthedEmailSection = () => {
  const user: User = useSelector((state: RootState) => state.user.value);
  const [newEmail, setNewEmail] = useState("");
  // const [inputNewEmail, setInputNewEmail] = useState("");
  let newPassword: string;
  let currentPassword: string = user.password;

  // メールアドレスの「変更」でトリガーされるメールアドレス変更関数
  const handleChangeEmailAdress = async () => {
    if (newEmail) {
      changeEmailAdress(newEmail, currentPassword);
      setNewEmail("");
    }
  };

  // パスワードの「変更」でトリガーされるメールアドレス変更関数
  const handleChangePassword = async () => {};

  return (
    <>
      <h2 className="authed-account-section-h2">アカウント設定</h2>
      <div className="authed-account-section">
        <div className="authed-account-section-email">
          {/* メールセクション */}
          <p>メールアドレスの変更</p>
          <div className="authed-account-section-email-item">
            <p>現在のメールアドレス：</p>
            <p className="authed-account-section-email-item-value-email">
              {user.email}
            </p>
          </div>
          <div className="authed-account-section-email-item">
            <p>新しいメールアドレス：</p>
            <input
              className="authed-account-section-email-item-value-email"
              value={newEmail}
              onChange={(event) => {
                setNewEmail(event.target.value);
              }}
            ></input>
          </div>
          {/* <div className="authed-account-section-email-item">
            <p>パスワード：</p>
            <input className="authed-account-section-email-item-value-password"></input>
          </div> */}
          <button onClick={handleChangeEmailAdress}>変更</button>
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
