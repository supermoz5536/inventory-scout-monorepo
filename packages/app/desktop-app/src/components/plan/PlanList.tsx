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
            料金プラン
          </DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: "#e8e8e8",
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
          </DialogContent>
        </Dialog>
      </React.Fragment>
    </>
  );
};

export default PlanList;
