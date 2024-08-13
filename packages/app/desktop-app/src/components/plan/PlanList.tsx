import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import React from "react";

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
  return (
    <React.Fragment>
      <Dialog open={isOpenPlanListDialog} onClose={handleClose}>
        <DialogTitle
          sx={{
            // marginBottom: "20px",
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
              月額プラン
              <Divider />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default PlanList;
