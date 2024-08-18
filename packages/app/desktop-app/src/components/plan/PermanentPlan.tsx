import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import CreateAccountForm from "../account/CreateAccountForm";
import { useSelector } from "react-redux";
import { handleCheckoutSessionAndRedirect } from "../../service/stripe";
import { callCancelSubscriptionImmediately } from "../../firebase/cloudFunctions";

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
          買い切りプラン
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
              marginTop: "10px",
              height: "100px",
              width: "300px",
              backgroundColor: "grey",
            }}
          >
            <p>全ての機能を無制限に利用することができます。</p>
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
              // 既に一括プランを購入済みの場合はボタンを無効化
              userRef.current.plan === "p"
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
    </>
  );
};
