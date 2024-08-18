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
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createAccount } from "../../service/account";
import { callCreateCheckoutSession } from "../../firebase/cloudFunctions";
import {
  handleCheckoutSessionAndRedirect,
  handleRedirectToCheckout,
} from "../../service/stripe";

const CreateAccountForm = ({
  isOpenCreateAccountFormDialog,
  setIsOpenCreateAccountFormDialog,
  isSelectedPlan,
}: {
  isOpenCreateAccountFormDialog: boolean;
  setIsOpenCreateAccountFormDialog: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  isSelectedPlan: string;
}) => {
  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const handleOpen = () => {
    setIsOpenCreateAccountFormDialog(true);
  };
  const handleClose = () => {
    setIsOpenCreateAccountFormDialog(false);
    reset({ email: "", password: "", confirmPassword: "" }); // フォームの入力値とエラーステートをリセット
  };

  // フォーム送信時の処理
  const onSubmit: SubmitHandler<CreateAccountFormInput> = async (data) => {
    // バリデーションチェックOK！なときに行う処理を追加
    await createAccount(data.email, data.password);
    if (isSelectedPlan === "s" || isSelectedPlan === "p") {
      await handleCheckoutSessionAndRedirect(
        userRef.current.uid,
        isSelectedPlan
      );
    }
    setIsOpenCreateAccountFormDialog(false);
  };

  // バリデーションルール
  const schema = yup.object({
    email: yup
      .string()
      .required("メールアドレスを入力してください。")
      .email("メールアドレスの形式が正しくありません。"),
    password: yup
      .string()
      .required("パスワードを入力してください。")
      .min(6, "パスワードは６文字以上が必要です。")
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/,
        "パスワードは、英字、数字、および特殊文字をそれぞれ1文字以上含む必要があります。"
      ),
    confirmPassword: yup
      .string()
      .required("パスワードの確認")
      // oneOf メソッドは、値が指定された配列の中のいずれかと
      // 一致することを確認するためのバリデーションルールです。
      .oneOf([yup.ref("password")], "パスワードが一致しません。"),
  });

  // フォーム管理補助ライブラリの React Hook Form から、以下を分割代入
  // ・各フォームを接続する register
  // ・登録情報の送信時のコールバックを設定する handleSubmit
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountFormInput>({
    resolver: yupResolver(schema),
  });

  return (
    <React.Fragment>
      <Dialog open={isOpenCreateAccountFormDialog} onClose={handleClose}>
        <DialogTitle
          sx={{
            fontSize: "25px",
            fontWeight: "bold",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          アカウント作成
        </DialogTitle>
        <DialogContentText>
          <Typography
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            プランのご購入にはアカウントが必要です。
          </Typography>
        </DialogContentText>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="email"
            label="メールアドレス"
            type="email"
            fullWidth
            variant="standard"
            {...register("email")}
            error={"email" in errors} // エラーが含まれているかを確認するプロパティ
            helperText={errors.email?.message} // エラー内容をUIに表示
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="password"
            label="パスワード"
            // type={isVisiblePassword ? "text" : "password"}
            fullWidth
            variant="standard"
            {...register("password")}
            error={"password" in errors}
            helperText={errors.password?.message}
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="confirmPassword"
            label="パスワードの確認"
            // type={isVisiblePassword ? "text" : "password"}
            fullWidth
            variant="standard"
            {...register("confirmPassword")}
            error={"confirmPassword" in errors}
            helperText={errors.confirmPassword?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            sx={{
              fontWeight: "bold",
            }}
          >
            作成
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateAccountForm;
