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
                    <p>
                      無料で利用することができますが、いくつかの制限がつきます
                      。
                    </p>
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
                    onClick={() => setIsOpenCreateAccountFormDialog(true)}
                    sx={{
                      marginTop: "10px",
                      width: "50px",
                    }}
                  >
                    aa
                  </Button>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </React.Fragment>
      <div>
        <CreateAccountForm
          isOpenCreateAccountFormDialog={isOpenCreateAccountFormDialog}
          setIsOpenCreateAccountFormDialog={setIsOpenCreateAccountFormDialog}
        />
      </div>
    </>
  );
};

export default PlanList;
