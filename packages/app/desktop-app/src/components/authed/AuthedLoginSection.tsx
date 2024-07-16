import React, { useEffect, useRef, useState } from "react";
import "./AuthedLoginSection.css";
import { getFirstUserEmail } from "../../firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../firebase/authentication";
import { changeIsAuthed, changeIsAutoLogIn } from "../../slices/userSlice";

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
      dispatch(changeIsAuthed(false));
      dispatch(changeIsAutoLogIn(false));
    }
  };

  // マウント時にIsCheckedを判定して状態変更する関数
  // Trueならstore管理のuserのisAutoLoginもTrueに
  // falseならstore管理のuserのisAutoLoginもfalseに
  useEffect(() => {
    console.log("▲ 1 isChecked =", isChecked);
    if (isChecked === true) {
      // console.log("▲ 2 changeIsAutoLogIn 起動");
      dispatch(changeIsAutoLogIn(true));
    } else {
      // console.log("▲ 3 changeIsAutoLogIn 起動");
      dispatch(changeIsAutoLogIn(false));
    }
    // console.log("▲ 4 user.isAutoLogIn", user.isAutoLogIn);
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
                ? "未加入です。"
                : user.plan === "s"
                ? "月額課金プランに加入中です"
                : user.plan === "p"
                ? "永久利用プランに加入中です。"
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
