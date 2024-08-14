import React, { useState } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import CreateAccountForm from "../account/CreateAccountForm";

const SubscriptionPlan = () => {
  const [isSelectedPlan, setIsSelectedPlan] = useState<string>("s");
  const [isOpenCreateAccountFormDialog, setIsOpenCreateAccountFormDialog] =
    useState<boolean>(false);

  return (
    <>
      <Box
        sx={{
          marginTop: "20px",
          height: "600px",
          width: "400px",
          backgroundColor: "white",
          marginX: "20px",
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
            onClick={() => {
              setIsOpenCreateAccountFormDialog(true);
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

export default SubscriptionPlan;
