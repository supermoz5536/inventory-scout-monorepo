import React, { useState } from "react";
import "./AuthedAccountSection.css";
import { useSelector } from "react-redux";
import {
  changeEmailAdress,
  changePassword,
} from "../../firebase/authentication";

const AuthedAccountSection = () => {
  const user: User = useSelector((state: RootState) => state.user.value);
  const [inputEmail, setInputEmail] = useState("");
  const [inputCurrentPassword, setInputCurrentPassword] = useState("");
  const [inputNewPassword, setInputNewPassword] = useState("");
  const [inputConfirmedPassword, setInputConfirmedPassword] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState<boolean | null>(
    null
  );

  // メールアドレスの「変更」でトリガーされるメールアドレス変更関数
  const handleChangeEmailAdress = async () => {
    if (inputEmail) {
      changeEmailAdress(inputEmail, user.password);
      setInputEmail("");
    }
  };

  // パスワードの「変更」でトリガーされるメールアドレス変更関数
  const handleChangePassword = async () => {
    if (
      inputCurrentPassword &&
      inputNewPassword &&
      inputConfirmedPassword &&
      inputNewPassword === inputConfirmedPassword
    ) {
      const result: boolean = await changePassword(
        inputCurrentPassword,
        inputNewPassword
      );
      setIsPasswordChanged(result);
      setInputCurrentPassword("");
      setInputNewPassword("");
      setInputConfirmedPassword("");
    }
  };

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
              placeholder="新しいメールアドレス"
              value={inputEmail}
              onChange={(event) => {
                setInputEmail(event.target.value);
              }}
            ></input>
          </div>
          <button onClick={handleChangeEmailAdress}>変更</button>
        </div>
        {/* パスワードセクション */}
        <div className="authed-account-section-password">
          <p>パスワードの変更</p>
          <div className="authed-account-section-password-item">
            <p>現在のパスワード：</p>
            <input
              placeholder="現在のパスワード"
              type={"password"}
              value={inputCurrentPassword}
              onChange={(event) => {
                setInputCurrentPassword(event.target.value);
              }}
            ></input>
          </div>
          <div className="authed-account-section-password-item">
            <p>新しいパスワード：</p>
            <input
              placeholder="新しいパスワード"
              type={"password"}
              value={inputNewPassword}
              onChange={(event) => {
                setInputNewPassword(event.target.value);
              }}
            ></input>
          </div>
          <div className="authed-account-section-password-item">
            <p>パスワードの確認：</p>
            <input
              placeholder="新しいパスワードを再度入力"
              type={"password"}
              value={inputConfirmedPassword}
              onChange={(event) => {
                setInputConfirmedPassword(event.target.value);
              }}
            ></input>
          </div>
          <div className="authed-account-section-password-item">
            <button onClick={handleChangePassword}>変更</button>
            <p className="authed-account-section-password-item-result">
              {isPasswordChanged === null
                ? ""
                : isPasswordChanged
                ? "パスワードが変更されました"
                : "パスワード変更に失敗しました"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthedAccountSection;
