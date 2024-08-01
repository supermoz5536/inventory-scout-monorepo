import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { updateIsScrapingTrueAll } from "../slices/asinDataListSlice";
import {
  changeShowButtonStatus,
  changeSystemStatus,
} from "../slices/systemStatusSlice";

const ConfirmReExcuteDialog = ({
  isOpenDialog,
  setIsOpenDialog,
}: ConfirmReExcuteDialogProps) => {
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
    console.log("■ excuted runScraping in dialog");
    dispatch(updateIsScrapingTrueAll());
    await new Promise((resolve) => setTimeout(resolve, 200)); // 状態変数の更新が完了するまで200ms待機
    window.myAPI.runScraping(asinDataListRef.current);
    dispatch(changeSystemStatus(1));
    dispatch(changeShowButtonStatus(1));
  };

  const handleActionNo = () => {
    setIsOpenDialog(false);
    dispatch(changeSystemStatus(4));
    dispatch(changeShowButtonStatus(0));
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
          {"本日分のデータ取得は、全てのASINですでに完了しています。"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>
              もしこのまま実行すると、新規取得データを本日分として上書きします。
            </p>
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
