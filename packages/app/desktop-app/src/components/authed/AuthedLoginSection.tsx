import React, { useEffect, useRef, useState } from "react";
import "./AuthedLoginSection.css";
import { getFirstUserEmail } from "../../firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../firebase/authentication";
import { changeIsAuthed, changeIsAutoLogIn } from "../../slices/userSlice";

export const AuthedLoginSection = () => {
  const user: User = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    const signOutResult: boolean = await logOut();
    console.log("IsAutoLogIn 1 =", userRef.current.isAutoLogIn);

    if (signOutResult === true) {
      dispatch(changeIsAuthed(false));
      dispatch(changeIsAutoLogIn(false));
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log("IsAutoLogIn 2 =", userRef.current.isAutoLogIn);
    }
  };

  return (
    <>
      <h2 className="authed-login-section-h2">ログイン設定</h2>
      <div className="authed-login-section">
        <div className="authed-login-section-email">
          <p className="authed-login-section-email-text">ログイン中：</p>
          <p className="authed-login-section-email-adress">{user.email}</p>
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
