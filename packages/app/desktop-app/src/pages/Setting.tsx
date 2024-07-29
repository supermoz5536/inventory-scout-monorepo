import React, { useEffect, useState } from "react";
import "./Setting.css";
import GuestSetting from "../components/guest/GuestSetting";
import AuthedSetting from "../components/authed/AuthedSetting";
import { useSelector } from "react-redux";

const Setting = () => {
  const user = useSelector((state: RootState) => state.user.value);

  // 「次回からは自動でログインする」のチェックボックスの真偽値の状態を格納する変数を宣言
  const [isChecked, setIsChecked] = useState<boolean>(user.isAutoLogIn);

  // 子コンポーネント(GuestLoginSection)にpropsで渡し
  // 親コンポーネント(Setting)のisChecked変数を更新して
  // 子コンポーネント(AuthedLoginSection)に伝播させるための
  // 変更関数を宣言
  const handleCheckBoxChange = (value: boolean) => {
    setIsChecked(value);
  };

  useEffect(() => {
    console.log("isChecked =", isChecked);
  }, [isChecked]);

  return (
    <div>
      <h1 className="setting-h1">環境設定</h1>
      {user.isAuthed ? (
        <>
          {/* ログインしてる場合のコンポーネント読み込み */}
          <AuthedSetting isChecked={isChecked} />
        </>
      ) : (
        <>
          {/* ログアウトしてる場合のコンポーネント読み込み */}
          <GuestSetting handleCheckBoxChange={handleCheckBoxChange!} />
        </>
      )}
    </div>
  );
};

export default Setting;
