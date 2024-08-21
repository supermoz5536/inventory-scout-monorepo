import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider, Button, IconButton } from "@mui/material";
import CreateAccountForm from "../account/CreateAccountForm";
import { useSelector } from "react-redux";
import { handleCheckoutSessionAndRedirect } from "../../service/stripe";
import { callUpdateCancelAtPeriodEnd } from "../../firebase/cloudFunctions";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import { convertTimeStampFromUnixToStandard } from "../../util/dateFormatter";
import ConfirmChangeToFreePlanDialog from "./ConfirmChangeToFreePlanDialog";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import DoneIcon from "@mui/icons-material/Done";
import { CheckCircle } from "@mui/icons-material";

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
  const [
    isOpenConfirmChangeToFreePlanDialog,
    setIsOpenConfirmChangeToFreePlanDialog,
  ] = useState<boolean>(false);

  const handleClickButton = async () => {
    if (userRef.current.isAuthed === true) {
      // ログインしてる場合（ = アカウント作成済みなので）
      // => フリープラン変更の確認のダイアログ
      setIsOpenConfirmChangeToFreePlanDialog(true);
    } else if (userRef.current.isAuthed === false) {
      // ログインしてない場合（ = アカウント未作成なので）
      // => アカウント作成フォーム
      setIsOpenCreateAccountFormDialog(true);
    }
  };

  const [isOpenSnackBar, setIsOpenSnackBar] = React.useState<boolean>(false);

  const handleClose = async (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
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
          boxShadow: 4,
          position: "relative",
        }}
      >
        {userRef.current.plan === "f" ? (
          <CheckCircle
            sx={{
              color: "#69d16e",
              position: "absolute",
              top: "1%",
              right: "2%",
            }}
          />
        ) : null}
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
            marginBottom: "20px",
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
              height: "157.5px",
              width: "350px",
              marginY: "20px",
              backgroundColor: "#69d16e",
            }}
          >
            <Box
              sx={{
                marginTop: "20px",
                marginLeft: "13px",
                height: "50px",
                width: "350px",
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
              }}
            >
              <EmojiObjectsIcon
                sx={{
                  marginTop: "2px",
                  color: "white",
                  fontSize: "21px",
                  marginRight: "10px",
                }}
              />
              <p
                style={{
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                無料で利用することができますが
                <br />
                いくつかの機能が制限されます。
              </p>
            </Box>
            <Box
              sx={{
                marginTop: "20px",
                marginLeft: "13px",
                height: "50px",
                width: "350px",
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
              }}
            >
              <CloseIcon
                sx={{
                  marginTop: "1px",
                  color: "white",
                  opacity: 0.6,
                  fontSize: "22px",
                  marginRight: "10px",
                }}
              />
              <p
                style={{
                  color: "white",
                  opacity: 0.6,
                  fontWeight: "bold",
                }}
              >
                在庫データ取得 & 指定時刻での予約機能
                <br />
                を利用できます。
              </p>
            </Box>
          </Box>
          <Divider
            variant="middle"
            sx={{
              borderWidth: "1px",
              color: "black",
              width: "363px",
            }}
          />
          <Box
            sx={{
              marginTop: "20px",
              marginLeft: "40px",
              width: "350px",
              fontSize: "14px",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
              alignItems: "start",
            }}
          >
            <DoneIcon
              sx={{
                color: "#4caf50",
                fontSize: "17.5px",
                marginRight: "7.5px",
              }}
            />
            <p>在庫データの閲覧</p>
          </Box>
          <Box
            sx={{
              marginTop: "10px",
              marginLeft: "40px",
              width: "350px",
              fontSize: "14px",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
              alignItems: "start",
            }}
          >
            <DoneIcon
              sx={{
                color: "#4caf50",
                fontSize: "17.5px",
                marginRight: "7.5px",
              }}
            />
            <p>在庫データのCSV形式出力</p>
          </Box>
          <Box
            sx={{
              marginTop: "10px",
              marginLeft: "40px",
              width: "350px",
              fontSize: "14px",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
              alignItems: "start",
            }}
          >
            <DoneIcon
              sx={{
                color: "#4caf50",
                fontSize: "17.5px",
                marginRight: "7.5px",
              }}
            />
            <p>ASINリストの追加、削除、編集機能</p>
          </Box>
          <Box
            sx={{
              marginTop: "10px",
              marginLeft: "40px",
              width: "350px",
              fontSize: "14px",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
              alignItems: "start",
            }}
          >
            <DoneIcon
              sx={{
                color: "#4caf50",
                fontSize: "17.5px",
                marginRight: "7.5px",
              }}
            />
            <p>ASINリストのファイル書き出し、読み込み</p>
          </Box>
          <Box
            sx={{
              marginTop: "10px",
              marginLeft: "40px",
              width: "350px",
              fontSize: "14px",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
              alignItems: "start",
            }}
          >
            <DoneIcon
              sx={{
                color: "#4caf50",
                fontSize: "17.5px",
                marginRight: "7.5px",
              }}
            />
            <p>ユーザー設定画面へのアクセス</p>
          </Box>
          <Divider
            variant="middle"
            sx={{
              marginTop: "20px",
              borderWidth: "1px",
              color: "black",
              width: "363px",
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
              marginTop: "30px",
              backgroundColor: "#5ac95f",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#CB0000", // ホバー時の背景色
              },
            }}
          >
            プランを選択
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
      <div>
        <ConfirmChangeToFreePlanDialog
          isOpenConfirmChangeToFreePlanDialog={
            isOpenConfirmChangeToFreePlanDialog
          }
          setIsOpenConfirmChangeToFreePlanDialog={
            setIsOpenConfirmChangeToFreePlanDialog
          }
        />
      </div>
    </>
  );
};

export default FreePlan;
