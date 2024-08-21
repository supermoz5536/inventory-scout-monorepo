import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import CreateAccountForm from "../account/CreateAccountForm";
import SubscriptionPlan from "./SubscriptionPlan";
import FreePlan from "./FreePlan";
import { PermanentPlan } from "./PermanentPlan";
import CloseIcon from "@mui/icons-material/Close";
import { CloseOutlined, CloseRounded } from "@mui/icons-material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const PlanList = ({
  isOpenPlanListDialog,
  setIsOpenPlanListDialog,
}: {
  isOpenPlanListDialog: boolean;
  setIsOpenPlanListDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleOpen = () => {
    setIsOpenPlanListDialog(true);
  };
  const handleClose = () => {
    setIsOpenPlanListDialog(false);
  };

  const [isOpenCreateAccountFormDialog, setIsOpenCreateAccountFormDialog] =
    useState<boolean>(false);

  return (
    <>
      <React.Fragment>
        <Dialog
          open={isOpenPlanListDialog}
          onClose={handleClose}
          maxWidth={false}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: "bold",
              color: "white",
              backgroundColor: "#287fd5",
              boxShadow: 2,
              zIndex: 1, // ① zIndex は position が static 以外の場合にのみ機能する
              position: "relative", // ② なのでpositionを明示
            }}
          >
            利用料金 ご案内
            <Button
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: "2%",
                top: "14%",
              }}
            >
              <CancelOutlinedIcon
                sx={{
                  color: "white",
                  fontSize: "60px",
                  borderRadius: "40px",
                  padding: "0px",
                  "&:hover": {
                    color: "#d5d5d5", // ホバー時のアイコンの色
                  },
                }}
              />
            </Button>
          </DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: "#e8e8e8",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <FreePlan />
              <SubscriptionPlan />
              <PermanentPlan />
            </Box>
            <Box
              sx={{
                marginTop: "10px",
                marginLeft: "15px",
                marginRight: "15px",
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
                position: "absolute",
                bottom: "3%",
                right: "3%",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                }}
              >
                注：
              </p>
              <p
                style={{
                  fontSize: "10px",
                }}
              >
                月額プランから買い切りプランに変更された場合、残りの利用可能期間に対する
                <br />
                日割り返金は行われません。
              </p>
            </Box>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    </>
  );
};

export default PlanList;
