import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  callFetchPeriodEndDate,
  callUpdateCancelAtPeriodEnd,
} from "../../firebase/cloudFunctions";
import { convertTimeStampFromUnixToStandard } from "../../util/dateFormatter";
import CloseIcon from "@mui/icons-material/Close";

const ConfirmChangeToFreePlanDialog = ({
  isOpenConfirmChangeToFreePlanDialog,
  setIsOpenConfirmChangeToFreePlanDialog,
}: {
  isOpenConfirmChangeToFreePlanDialog: boolean;
  setIsOpenConfirmChangeToFreePlanDialog: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}) => {
  // ユーザー関係の状態変数の取得
  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [message, setMessage] = useState<string>("initial message");
  const [cancelAt, setCancelAt] = useState("");
  const [isOpenSnackBar, setIsOpenSnackBar] = React.useState<boolean>(false);
  const [periodEndDate, setPeriodEndDate] = useState<string>("");

  const handleClose = () => {
    setIsOpenConfirmChangeToFreePlanDialog(false);
  };
  const handleChange = async () => {
    const result = await callUpdateCancelAtPeriodEnd(userRef.current.uid);
    if (result) {
      const { message, cancelAt } = result;
      setMessage(message);
      setCancelAt(convertTimeStampFromUnixToStandard(cancelAt));

      if (message === "canceled" || message === "already_canceled") {
        // 月額プラン => フリープランへの変更処理が
        // 成功したのでスナックバーで通知
        setIsOpenConfirmChangeToFreePlanDialog(false);
        setIsOpenSnackBar(true);
      }
    } else {
      setMessage("error");
    }
  };

  const handleCloseSnackBar = async (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    setIsOpenSnackBar(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMessage("initial message");
    setCancelAt("");
  };

  // マウント時に一回だけ月額プランの期末日を取得します。
  useEffect(() => {
    // 即時関数で非同期処理
    (async () => {
      if (userRef.current.plan === "s") {
        const result = await callFetchPeriodEndDate(userRef.current.uid);
        setPeriodEndDate(result);
      }
    })();
  }, []);

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleCloseSnackBar} />
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnackBar}
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
      <React.Fragment>
        <Dialog
          open={isOpenConfirmChangeToFreePlanDialog}
          onClose={handleClose}
        >
          <DialogTitle
            sx={{
              marginTop: "10px",
              fontSize: "25px",
              fontWeight: "bold",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            本当に変更しますか？
          </DialogTitle>
          <DialogContentText>
            <Typography
              sx={{
                marginTop: "10px",
                paddingX: "20px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
              }}
            >
              {`実行すると、月額プランは残りのご利用可能期間の最終日(${periodEndDate})に自動解約され、そのタイミングでフリープランへの変更が反映されます。`}
              <br />
              <br />
              解約日までは引き続き月額プランでご利用いただけます
            </Typography>
          </DialogContentText>
          <DialogContent></DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>キャンセル</Button>
            <Button
              variant="contained"
              onClick={handleChange}
              sx={{
                backgroundColor: "#EF0000",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#CB0000", // ホバー時の背景色
                },
              }}
            >
              変更する
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
      <div>
        <Snackbar
          open={isOpenSnackBar}
          onClose={handleCloseSnackBar}
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
              : message === "error"
              ? "サーバーからプランデータを取得する際にエラー(error:0001)が発生しました、管理者にお問い合わせください。"
              : "プランの変更手続きの途中でシステムエラー(error:0002)が発生しました、管理者にお問い合わせください。"
          }
          action={action}
        />
      </div>
    </>
  );
};

export default ConfirmChangeToFreePlanDialog;
