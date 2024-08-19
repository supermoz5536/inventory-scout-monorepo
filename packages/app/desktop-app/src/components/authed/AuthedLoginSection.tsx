import React, { useEffect, useRef, useState } from "react";
import "./AuthedLoginSection.css";
import { getFirstUserEmail } from "../../firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../firebase/authentication";
import { changeIsAutoLogIn, updateUser } from "../../slices/userSlice";
import { callFetchPeriodEndDate } from "../../firebase/cloudFunctions";

export const AuthedLoginSection = ({ isChecked }: IsAutoLoginProps) => {
  const user: User = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const dispatch = useDispatch<AppDispatch>();

  const [periodEndDate, setPeriodEndDate] = useState<string>("");

  // マウント時に一回だけ月額プランの期末日を取得します。
  useEffect(() => {
    // 即時関数で非同期処理
    (async () => {
      const result = await callFetchPeriodEndDate(userRef.current.uid);
      setPeriodEndDate(result);
    })();

    callFetchPeriodEndDate(userRef.current.uid);
  }, []);

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
            <p className="authed-login-section-email-adress">
              {userRef.current.email}
            </p>
          </div>
          <div className="authed-login-section-email-line">
            <p className="authed-login-section-email-text">ご利用状況：</p>
            <p className="authed-login-section-email-adress">
              {userRef.current.plan === "f"
                ? "フリープランに加入中"
                : userRef.current.plan === "s"
                ? `月額プランに加入中`
                : userRef.current.plan === "p"
                ? "買い切りプランに加入中"
                : null}
            </p>
          </div>
        </div>
        {userRef.current.plan === "s" ? (
          <div className="authed-login-section-email-line">
            <p className="authed-login-section-email-text">次回更新日：</p>
            <p className="authed-login-section-email-adress">{periodEndDate}</p>
          </div>
        ) : null}

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
