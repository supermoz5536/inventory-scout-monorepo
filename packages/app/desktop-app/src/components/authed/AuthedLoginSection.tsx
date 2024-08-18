import React, { useEffect, useRef, useState } from "react";
import "./AuthedLoginSection.css";
import { getFirstUserEmail } from "../../firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../firebase/authentication";
import { changeIsAutoLogIn, updateUser } from "../../slices/userSlice";

export const AuthedLoginSection = ({ isChecked }: IsAutoLoginProps) => {
  const user: User = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    const signOutResult: boolean = await logOut();

    if (signOutResult === true) {
      // 手動でログアウトしたらローカルのユーザー情報を初期化
      dispatch(
        updateUser({
          uid: "",
          email: "",
          password: "",
          isAuthed: false,
          isAutoLogIn: false,
          is_cancel_progress: false,
          plan: "",
          createdAt: "",
        }),
      );
    }
  };

  // マウント時にIsCheckedを判定して状態変更する関数
  // Trueならstore管理のuserのisAutoLoginもTrueに
  // falseならstore管理のuserのisAutoLoginもfalseに
  useEffect(() => {
    if (isChecked === true) {
      dispatch(changeIsAutoLogIn(true));
    } else {
      dispatch(changeIsAutoLogIn(false));
    }
  });

  return (
    <>
      <h2 className="authed-login-section-h2">ログイン設定</h2>
      <div className="authed-login-section">
        <div className="authed-login-section-email">
          <div className="authed-login-section-email-line">
            <p className="authed-login-section-email-text">ログイン中：</p>
            <p className="authed-login-section-email-adress">{user.email}</p>
          </div>
          <div className="authed-login-section-email-line">
            <p className="authed-login-section-email-text">ご利用状況：</p>
            <p className="authed-login-section-email-adress">
              {user.plan === "f"
                ? "フリープランです。"
                : user.plan === "s"
                ? "月額プランに加入中です"
                : user.plan === "p"
                ? "買い切りプランに加入中です。"
                : null}
            </p>
          </div>
        </div>
        <button
          className="authed-login-section-login-button"
          onClick={() => {
            handleLogout();
          }}
        >
          ログアウト
        </button>
      </div>
    </>
  );
};
