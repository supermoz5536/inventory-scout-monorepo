import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { removeAbsentFbaAsin } from "../../slices/asinDataListSlice";

export const ConfirmDeleteFbaDialog = ({
  isOpenConfirmDeleteFbaDialog: isOpenDialog,
  setIsOpenConfirmDeleteFbaDialog: setIsOpenDialog,
}: ConfirmDeleteFbaDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );
  const asinDataListRef = useRef(asinDataList);
  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  const handleActionYes = async () => {
    setIsOpenDialog(false);
    handleRemoveIsAmazonAsin();
  };

  const handleActionNo = () => {
    setIsOpenDialog(false);
  };

  /// FBA出品者のいないAsinリストを削除して
  /// ストレージを最新に更新する関数
  const handleRemoveIsAmazonAsin = async () => {
    dispatch(removeAbsentFbaAsin());
    // 状態変数の更新が完了するまで200ms待機
    await new Promise((resolve) => setTimeout(resolve, 200));
    // ストレージに最新のasinDataListを保存
    await window.myAPI.saveData(asinDataListRef.current);
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
          {"この操作は取り消せません。"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>FBA出品者が0人のASINを全て削除してよいですか？</p>
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
