import React, { useState } from "react";
import "./Setting.css";
import GuestSetting from "../components/guest/GuestSetting";
import AuthedSetting from "../components/authed/AuthedSetting";
import { useSelector } from "react-redux";

const Setting = () => {
  const user = useSelector((state: RootState) => state.user.value);

  return (
    <div>
      <h1 className="setting-h1">環境設定</h1>
      {user.isAuthed ? (
        <>
          {/* ログインしてる場合のコンポーネント読み込み */}
          <AuthedSetting />
        </>
      ) : (
        <>
          {/* ログアウトしてる場合のコンポーネント読み込み */}
          <GuestSetting />
        </>
      )}
    </div>
  );
};

export default Setting;
