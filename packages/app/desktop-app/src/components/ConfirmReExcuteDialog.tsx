import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const ConfirmReExcuteDialog = ({
  isOpenDialog,
  setIsOpenDialog,
}: ConfirmReExcuteDialogProps) => {
  const handleClickOpen = () => {
    setIsOpenDialog(true);
  };

  const handleActionYes = () => {
    setIsOpenDialog(false);
    // ■■■■■■■■ スクレイピングの実行
  };

  const handleActionNo = () => {
    setIsOpenDialog(false);
  };

  return (
    <React.Fragment>
      <Dialog
        open={isOpenDialog}
        onClose={handleActionYes}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"本日分のデータ取得はすでに完了しています。"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>もしこのまま実行すると、新規取得データを上書きします。</p>
            {/* <br /> */}
            <p>本当に実行しますか？</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleActionNo}
            variant="text"
            sx={{
              "&:hover": {
                backgroundColor: "#D7D7D7", // ホバー時の背景色
              },
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleActionYes}
            variant="contained"
            sx={{
              backgroundColor: "#EF0000",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#CB0000", // ホバー時の背景色
              },
            }}
          >
            実行する
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default ConfirmReExcuteDialog;
