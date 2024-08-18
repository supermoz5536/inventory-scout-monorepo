import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider, Button, IconButton } from "@mui/material";
import CreateAccountForm from "../account/CreateAccountForm";
import { useSelector } from "react-redux";
import { handleCreateCheckoutSessionAndRedirect } from "../../service/stripe";
import { callUpdateCancelAtPeriodEnd } from "../../firebase/cloudFunctions";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import { convertTimeStampFromUnixToStandard } from "../../util/dateFormatter";

const FreePlan = () => {
  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [message, setMessage] = useState<string>("initial message");
  const [cancelAt, setCancelAt] = useState("");
  const [isSelectedPlan, setIsSelectedPlan] = useState<string>("f");
  const [isOpenCreateAccountFormDialog, setIsOpenCreateAccountFormDialog] =
    useState<boolean>(false);

  const handleClickButton = async () => {
    if (userRef.current.isAuthed === true) {
      // ログインしてる場合（ = アカウント作成済みなので）
      // => 月額プランのキャンセル処理
      const result = await callUpdateCancelAtPeriodEnd(userRef.current.uid);

      if (result) {
        const { message, cancelAt } = result;
        setMessage(message);
        setCancelAt(convertTimeStampFromUnixToStandard(cancelAt));

        if (message === "canceled" || message === "already_canceled") {
          // 月額プラン => フリープランへの変更処理が
          // 成功したのでスナックバーで通知
          setIsOpenSnackBar(true);
        }
      }
    } else if (userRef.current.isAuthed === false) {
      // ログインしてない場合（ = アカウント未作成なので）
      // => アカウント作成フォーム
      setIsOpenCreateAccountFormDialog(true);
    }
  };

  const [isOpenSnackBar, setIsOpenSnackBar] = React.useState<boolean>(false);

  const handleClose = async (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    setIsOpenSnackBar(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMessage("initial message");
    setCancelAt("");
  };

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose} />
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <>
      <Box
        sx={{
          height: "600px",
          width: "400px",
          backgroundColor: "white",
          marginX: "20px",
          marginTop: "60px",
          marginBottom: "40px",
          boxShadow: 3,
        }}
      >
        <Typography
          sx={{
            marginTop: "15px",
            fontSize: "30px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
          }}
        >
          フリープラン
        </Typography>
        <Typography
          sx={{
            marginTop: "0px",
            marginBottom: "5px",
            fontSize: "20px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
          }}
        >
          （0円 / 月）
        </Typography>
        <Divider
          variant="middle"
          sx={{
            borderWidth: "1px",
          }}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              marginTop: "10px",
              height: "100px",
              width: "300px",
              backgroundColor: "grey",
            }}
          >
            <p>無料で利用することができますが、いくつかの制限がつきます 。</p>
            <br />
            <p>データ取得機能が使えます。</p>
          </Box>
          <Box
            sx={{
              marginTop: "30px",
              height: "100px",
              width: "300px",
              backgroundColor: "red",
            }}
          ></Box>
          <Divider
            variant="middle"
            sx={{
              marginTop: "10px",
              borderWidth: "2px",
              color: "black",
            }}
          />
          <Divider
            variant="middle"
            sx={{
              width: "363px",
              borderWidth: "1px",
            }}
          />
          <Button
            variant="contained"
            disabled={
              // 「いずれかの条件を満たさない場合」はボタンを無効化
              !(userRef.current.plan === "" || userRef.current.plan === "s")
            }
            onClick={() => {
              handleClickButton();
            }}
            sx={{
              marginTop: "10px",
              width: "50px",
            }}
          >
            aa
          </Button>
        </Box>
      </Box>
      <div>
        <CreateAccountForm
          isOpenCreateAccountFormDialog={isOpenCreateAccountFormDialog}
          setIsOpenCreateAccountFormDialog={setIsOpenCreateAccountFormDialog}
          isSelectedPlan={isSelectedPlan}
        />
      </div>
      <div>
        <Snackbar
          open={isOpenSnackBar}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          sx={{
            "& .MuiSnackbarContent-root": {
              position: "relative",
              paddingRight: "48px", // ボタン分のスペースを確保
            },
          }}
          message={
            message === "canceled"
              ? `プラン変更の手続きが完了しました。月額プランは残りのご利用可能期間の最終日（${cancelAt}）に自動解約され、そのタイミングでフリープランへの変更が反映されます。それまでは引き続き月額プランでご利用いただけます。`
              : message === "already_canceled"
              ? `既にプラン変更の手続きは完了しています。月額プランは残りのご利用可能期間の最終日（${cancelAt}）に自動解約され、そのタイミングでフリープランへの変更が反映されます。それまでは引き続き月額プランでご利用いただけます。`
              : "プランの変更手続きの途中でシステムエラー(error:0001)が発生しました、管理者にお問い合わせください。"
          }
          action={action}
        />
      </div>
    </>
  );
};

export default FreePlan;
