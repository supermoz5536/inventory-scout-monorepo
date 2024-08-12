import "./LoginFormDialog.css";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  TextField,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logInWithEmailAndPassword } from "../../firebase/authentication";
import { DocumentData } from "firebase/firestore";
import { getUserDoc } from "../../firebase/firestore";
import { updateUser } from "../../slices/userSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const LoginFormDialog = ({
  isOpenLoginFormDialog,
  setIsOpenLoginFormDialog,
}: {
  isOpenLoginFormDialog: boolean;
  setIsOpenLoginFormDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleClickOpen = () => {
    setIsOpenLoginFormDialog(true);
  };
  const handleClose = () => {
    setIsOpenLoginFormDialog(false);
    // 入力欄と、エラーステータスをリセット
    setInputEmail("");
    setInputPassword("");
    setErrorFlag("");
  };

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

  const [isAutoLoginCheckBox, setIsAutoLoginCheckBox] =
    useState<boolean>(false);

  // ログインボタンのコールバック
  const handleLogIn = async (
    inputEmail: string,
    inputPassword: string,
    isAutoLoginCheckBox: boolean
  ) => {
    console.log("1 handleLogIn");
    const userCredential = await logInWithEmailAndPassword(
      inputEmail,
      inputPassword
    );
    console.log("2 handleLogIn");
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
      console.log("3 handleLogIn");

      if (userDocData) {
        console.log("4 handleLogIn");
        // 最新のUserオブジェクトを生成
        const newUser: User = {
          uid: userCredential.user.uid,
          email: inputEmail,
          password: inputPassword,
          isAuthed: true,
          isAutoLogIn: isAutoLoginCheckBox,
          plan: userDocData["plan"],
          createdAt: userDocData["created_at"],
        };
        console.log("5 handleLogIn");
        // ストアのUserオブジェクトを更新
        dispatch(updateUser(newUser));

        // ログイン画面を閉じる
        setIsOpenLoginFormDialog(false);
      }
    } else if (userCredential && typeof userCredential === "string") {
      // ログイン失敗時のエラーハンドリング
      console.log("7 handleLogIn");
      setErrorFlag(userCredential);
    }
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open form dialog
      </Button>
      <Dialog open={isOpenLoginFormDialog} onClose={handleClose}>
        <DialogTitle
          sx={{
            marginLeft: "35px",
            marginBottom: "0px",
            fontSize: "25px",
            fontWeight: "bold",
          }}
        >
          アカウントにログイン
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="メールアドレス"
            type="email"
            fullWidth
            variant="standard"
            value={inputEmail}
            onChange={handleInputEmailChange}
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="パスワード"
            type={isVisiblePassword ? "text" : "password"}
            fullWidth
            variant="standard"
            value={inputPassword}
            onChange={handleInputPasswordChange}
          />
          <Button
            onClick={toggleVisiblePassword}
            sx={{
              height:
                "0%" /* ボタンの高さを親要素の高さに一致させ、結果的に中央に配置させる */,
              position:
                "absolute" /* 親要素の相対位置を基準にして絶対位置に配置 */,
              top: "52%",
              left: "82%",
              background: "none" /* 背景を透明に設定 */,
              border: "none" /* ボーダーを取り除く */,
              cursor:
                "pointer" /* ホバー時にポインター（手の形のカーソル）を表示 */,
              outline: "none" /* フォーカス時のアウトラインを取り除く */,
              color: "black",
            }}
          >
            <FontAwesomeIcon icon={isVisiblePassword ? faEyeSlash : faEye} />
          </Button>
          <div className="login-form-dialog">
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
          <Box
            sx={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <input
              type="checkbox"
              onChange={(event) => {
                setIsAutoLoginCheckBox(event.target.checked);
              }}
              style={{
                marginRight: "5px",
              }}
            />
            <p
              style={{
                fontSize: "12.5px",
              }}
            >
              次回から自動でログインする
            </p>
          </Box>
          <DialogContentText
            sx={{
              marginTop: "10px",
              fontSize: "12.5px",
              fontWeight: "bold",
              // textDecoration: "underline",
            }}
          >
            アカウントがない場合は、
            <Link
              component="button"
              sx={{
                fontSize: "12.5px",
                fontWeight: "bold",
                textDecoration: "underline",
                "&:hover": {
                  backgroundColor: "#ebebeb", // ホバー時の背景色
                  color: "#1976d2", // ホバー時の文字色
                  borderRadius: "4px", // 角丸を追加
                  textDecoration: "none", // 下線をなくす
                },
              }}
            >
              こちら
            </Link>
            から作成
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleLogIn(inputEmail, inputPassword, isAutoLoginCheckBox);
            }}
            sx={{
              fontWeight: "bold",
            }}
          >
            ログイン
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default LoginFormDialog;
