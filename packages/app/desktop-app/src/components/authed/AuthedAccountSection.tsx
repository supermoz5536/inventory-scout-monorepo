import React, { useState } from "react";
import "./AuthedAccountSection.css";
import { useDispatch, useSelector } from "react-redux";
import {
  changeEmailAdress,
  changePassword,
} from "../../firebase/authentication";

const AuthedAccountSection = () => {
  const user: User = useSelector((state: RootState) => state.user.value);
  const dispatch = useDispatch<AppDispatch>();
  const [inputEmail, setInputEmail] = useState("");
  const [inputCurrentPassword, setInputCurrentPassword] = useState("");
  const [inputNewPassword, setInputNewPassword] = useState("");
  const [inputConfirmedPassword, setInputConfirmedPassword] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState<number>(0);
  const [isEmailChanged, setIsEmailChanged] = useState<string | null>(null);

  // メールアドレスの「変更」でトリガーされるメールアドレス変更関数
  const handleChangeEmailAdress = async () => {
    if (inputEmail) {
      const result = await changeEmailAdress(inputEmail, user.password);
      if (result) {
        if (result === "e0") {
          setIsEmailChanged(result);
          setInputEmail("");
        } else {
          setIsEmailChanged(result);
        }
      }
    }
  };

  // パスワードの「変更」でトリガーされるメールアドレス変更関数
  const handleChangePassword = async () => {
    if (
      inputCurrentPassword === "" ||
      inputNewPassword === "" ||
      inputConfirmedPassword === ""
    ) {
      setIsPasswordChanged(1);
    } else if (inputCurrentPassword !== user.password) {
      setIsPasswordChanged(2);
    } else if (inputNewPassword !== inputConfirmedPassword) {
      setIsPasswordChanged(3);
    } else if (inputNewPassword.length < 6) {
      setIsPasswordChanged(4);
    } else {
      const result: boolean = await changePassword(
        inputCurrentPassword,
        inputNewPassword
      );
      if (result) {
        setIsPasswordChanged(5);
        setInputCurrentPassword("");
        setInputNewPassword("");
        setInputConfirmedPassword("");
      } else {
        setIsPasswordChanged(6);
      }
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
          <div className="authed-account-section-email-item-bottom">
            <button onClick={handleChangeEmailAdress}>変更</button>
            <p className="authed-account-section-email-item-result">
              {isEmailChanged === null
                ? ""
                : isEmailChanged === "e0"
                ? "メールアドレスの更新に成功しました。"
                : isEmailChanged === "e1"
                ? "無効なメールアドレスです。"
                : isEmailChanged === "e2"
                ? "メールアドレスが見つかりません。"
                : isEmailChanged === "e3"
                ? "このユーザーは無効化されています。"
                : isEmailChanged === "e4"
                ? "ネットワークエラーが発生しました。"
                : null}
            </p>
          </div>
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
          <div className="authed-account-section-password-item-bottom">
            <button
              className="authed-account-section-password-item-button"
              onClick={handleChangePassword}
            >
              変更
            </button>
            <p className="authed-account-section-password-item-result">
              {isPasswordChanged === 0
                ? ""
                : isPasswordChanged === 1
                ? "未入力の項目があります。"
                : isPasswordChanged === 2
                ? "入力したパスワードが現在のパスワードと一致しません。"
                : isPasswordChanged === 3
                ? "確認用パスワードが一致していません"
                : isPasswordChanged === 4
                ? "パスワードは最低でも6文字以上が必要です。"
                : isPasswordChanged === 5
                ? "パスワードが変更されました"
                : isPasswordChanged === 6
                ? "新しいパスワードの入力内容に誤りがあります。解決しない場合は運営者にお問い合わせください。"
                : null}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthedAccountSection;
