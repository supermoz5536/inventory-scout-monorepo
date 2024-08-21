import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import CreateAccountForm from "../account/CreateAccountForm";
import { useSelector } from "react-redux";
import { handleCheckoutSessionAndRedirect } from "../../service/stripe";

const SubscriptionPlan = () => {
  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [isSelectedPlan, setIsSelectedPlan] = useState<string>("s");
  const [isOpenCreateAccountFormDialog, setIsOpenCreateAccountFormDialog] =
    useState<boolean>(false);

  const handleClickButton = async () => {
    if (userRef.current.isAuthed === true) {
      // ログインしてる場合（ = アカウント作成済みなので）
      // => チェックアウトプロセス
      await handleCheckoutSessionAndRedirect(
        userRef.current.uid,
        isSelectedPlan,
      );
    } else if (userRef.current.isAuthed === false) {
      // ログインしてない場合（ = アカウント未作成なので）
      // => アカウント作成フォーム
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
          月額プラン
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
          （2490円 / 月）
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
              backgroundColor: "grey",
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
              !(userRef.current.plan === "" || userRef.current.plan === "f")
            }
            onClick={() => {
              handleClickButton();
            }}
            sx={{
              marginTop: "10px",
              backgroundColor: "#287fd5",
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

export default SubscriptionPlan;
