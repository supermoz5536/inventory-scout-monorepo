import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import CreateAccountForm from "../account/CreateAccountForm";
import { useSelector } from "react-redux";
import { handleCheckoutSessionAndRedirect } from "../../service/stripe";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import DoneIcon from "@mui/icons-material/Done";
import { CheckCircle } from "@mui/icons-material";

export const PermanentPlan = () => {
  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [isSelectedPlan, setIsSelectedPlan] = useState<string>("p");
  const [isOpenCreateAccountFormDialog, setIsOpenCreateAccountFormDialog] =
    useState<boolean>(false);

  const handleClickButton = async () => {
    // ログインしてる場合（ = アカウント作成済みなので）
    // => チェックアウトプロセス
    if (userRef.current.isAuthed === true) {
      // // 月額プランの場合は先に解約処理のハンドリング
      // if (userRef.current.plan === "s") {
      //   const result = await callCancelSubscriptionImmediately(
      //     userRef.current.uid,
      //   );
      //   console.log("result", result);
      // }

      await handleCheckoutSessionAndRedirect(
        userRef.current.uid,
        isSelectedPlan,
      );

      // ログインしてない場合（ = アカウント未作成なので）
      // => アカウント作成フォーム
    } else if (userRef.current.isAuthed === false) {
      setIsOpenCreateAccountFormDialog(true);
    }
  };

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
        {userRef.current.plan === "p" ? (
          <CheckCircle
            sx={{
              color: "#f58c83",
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
          買い切りプラン
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
          （49800円 / 一括）
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
              backgroundColor: "#f58c83",
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
              <TipsAndUpdatesIcon
                sx={{
                  marginTop: "2px",
                  color: "white",
                  fontSize: "22px",
                  marginRight: "10px",
                }}
              />
              <p
                style={{
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                全ての機能が制限なく利用できます。
                <br />
                頻繁に利用する人におすすめのプラン。
              </p>
            </Box>
            <Box
              sx={{
                marginTop: "20px",
                marginLeft: "12.5px",
                height: "50px",
                width: "350px",
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
              }}
            >
              <CheckCircle
                sx={{
                  marginTop: "1px",
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
              // 既に一括プランを購入済みの場合はボタンを無効化
              userRef.current.plan === "p"
            }
            onClick={() => {
              handleClickButton();
            }}
            sx={{
              marginTop: "30px",
              backgroundColor: "#f47c71",
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
    </>
  );
};
