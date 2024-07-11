import React, { useEffect, useRef, useState } from "react";
import "./GuestLoginSection.css";
import { logInWithEmailAndPassword } from "../../firebase/authentication";
import { getUserDoc } from "../../firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../slices/userSlice";
import { DocumentData } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { changeIsAutoLogIn } from "../../slices/userSlice";

const GuestLoginSection = ({ handleCheckBoxChange }: IsAutoLoginProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [errorFlag, setErrorFlag] = useState("");

  // パスワード表示制御ようのstate
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const toggleVisiblePassword = () => {
    setIsVisiblePassword(!isVisiblePassword);
  };

  // グローバル変数のuserの参照を定数で定義
  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // メールアドレス入力時のUI即時反映
  const [inputEmail, setInputEmail] = useState<string>("");
  const handleInputEmailChange = (event: any) => {
    setInputEmail(event.target.value);
  };

  // パスワード入力時のUI即時反映
  const [inputPassword, setInputPassword] = useState<string>("");
  const handleInputPasswordChange = (event: any) => {
    setInputPassword(event.target.value);
  };

  // ログインボタンのコールバック
  const handleLogIn = async (inputEmail: string, inputPassword: string) => {
    const userCredential = await logInWithEmailAndPassword(
      inputEmail,
      inputPassword
    );

    // オブジェクトが存在し
    // string型（エラーメッセージ）ではない場合は
    // 取得成功してる
    if (userCredential && typeof userCredential !== "string") {
      // ■ userCredential.user.uid と一致するドキュメントが存在する場合
      // firestoreからドキュメントデータを取得
      // プラン名とアカウント作成日を取得し、割り当てる
      const userDocData: DocumentData | undefined = await getUserDoc(
        userCredential.user.uid
      );

      if (userDocData) {
        // 最新のUserオブジェクトを生成
        const newUser: User = {
          uid: userCredential.user.uid,
          email: inputEmail,
          password: inputPassword,
          isAuthed: true,
          isAutoLogIn: userRef.current.isAutoLogIn,
          plan: userDocData["plan"],
          createdAt: userDocData["created_at"],
        };

        // ストアのUserオブジェクトを更新
        dispatch(updateUser(newUser));
      }

      // ログイン失敗時のエラーハンドリング
    } else if (userCredential && typeof userCredential === "string") {
      setErrorFlag(userCredential);
    }
  };

  // 「次回から自動でログインする」のコールバック
  const callHandleCheckBoxChange = (event: any) => {
    if (handleCheckBoxChange) {
      // 親コンポーネントから
      // AuthedLoginSectionに
      // 渡すpropes（isChecked）を変更
      handleCheckBoxChange(event.target.checked);
    }
  };

  return (
    <>
      <h2 className="guest-login-section-h2">ログイン設定</h2>
      <div className="guest-login-section">
        <div className="guest-login-section-email">
          <p>メールアドレス：</p>
          <input
            placeholder="メールアドレス"
            value={inputEmail}
            onChange={handleInputEmailChange}
          ></input>
        </div>
        <div className="guest-login-section-password">
          <p>パスワード：</p>
          <input
            placeholder="パスワード"
            type={isVisiblePassword ? "text" : "password"}
            value={inputPassword}
            onChange={handleInputPasswordChange}
          ></input>
          <button
            className="guest-login-section-password-toggle-button"
            onClick={toggleVisiblePassword}
          >
            <FontAwesomeIcon icon={isVisiblePassword ? faEyeSlash : faEye} />
          </button>
        </div>
        <div className="guest-login-section-login-button">
          <button
            onClick={() => {
              handleLogIn(inputEmail, inputPassword);
            }}
          >
            ログイン
          </button>

          {errorFlag === "" ? (
            <p></p>
          ) : errorFlag === "e0" ? (
            <p>無効なメールアドレスです</p>
          ) : errorFlag === "e1" ? (
            <p>メールアドレスが見つかりません</p>
          ) : errorFlag === "e2" ? (
            <p>パスワードが間違っています</p>
          ) : errorFlag === "e3" ? (
            <p>ログイン情報に誤りがあります。</p>
          ) : errorFlag === "e4" ? (
            <p>
              ログインの試行回数が多すぎます
              <br />
              少し時間をおいてからもう一度お試しください
            </p>
          ) : (
            <p>"不明なエラーです、運営者にお問い合わせください"</p>
          )}
        </div>
        <div className="guest-login-section-auto-login">
          <input
            type="checkbox"
            onChange={(event) => {
              callHandleCheckBoxChange(event);
            }}
          />
          <p>次回から自動でログインする</p>
        </div>
      </div>
    </>
  );
};

export default GuestLoginSection;
