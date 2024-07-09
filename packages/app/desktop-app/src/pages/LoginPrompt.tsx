import React, { useState } from "react";
import "./LoginPrompt.css";
import { useSelector } from "react-redux";
import GuestLoginSection from "../components/guest/GuestLoginSection";
import { AuthedLoginSection } from "../components/authed/AuthedLoginSection";

const LoginPrompt = () => {
  const user = useSelector((state: RootState) => state.user.value);

  return (
    <div>
      {user.isAuthed ? (
        <div className="login-pronpt-body">
          {/* ログインしてる場合のコンポーネント読み込み */}
          <AuthedLoginSection />
        </div>
      ) : (
        <div className="login-pronpt-body">
          {/* ログアウトしてる場合のコンポーネント読み込み */}
          <GuestLoginSection />
        </div>
      )}
    </div>
  );
};

export default LoginPrompt;
