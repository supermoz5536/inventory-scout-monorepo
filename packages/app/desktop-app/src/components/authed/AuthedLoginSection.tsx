import React, { useEffect, useState } from "react";
import "./AuthedLoginSection.css";
import { getFirstUserEmail } from "../../firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../firebase/authentication";
import { changeIsAuthed } from "../../slices/userSlice";

export const AuthedLoginSection = () => {
  const user: User = useSelector((state: RootState) => state.user.value);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    const signOutResult: boolean = await logOut();

    if (signOutResult === true) {
      dispatch(changeIsAuthed(false));
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
          onClick={handleLogout}
        >
          ログアウト
        </button>
      </div>
    </>
  );
};
