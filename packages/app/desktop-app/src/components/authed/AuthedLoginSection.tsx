import React, { useEffect, useState } from "react";
import "./AuthedLoginSection.css";
import { getFirstUserEmail } from "../../firebase/firestore";

export const AuthedLoginSection = () => {
  // テスト用ハードコード
  const [email, setEmail] = useState("");

  // ■■■■■■　ストア格納のuser変数から取得に変更すること　■■■■■■
  useEffect(() => {
    (async () => {
      const fetchedEmail = await getFirstUserEmail();
      setEmail(fetchedEmail);
    })();
  }, []);

  return (
    <>
      <h2 className="authed-login-section-h2">ログイン設定</h2>
      <div className="authed-login-section">
        <div className="authed-login-section-email">
          <p className="authed-login-section-email-text">ログイン中：</p>
          <p className="authed-login-section-email-adress">{email}</p>
        </div>
        <button className="authed-login-section-login-button">
          ログアウト
        </button>
      </div>
    </>
  );
};
