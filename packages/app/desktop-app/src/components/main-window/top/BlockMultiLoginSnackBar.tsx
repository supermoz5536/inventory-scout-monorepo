import {
  Button,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";

export const BlockMultiLoginSnackBar = ({
  isOpenBlockMultiLoginSnackBar,
  setIsOpenBlockMultiLoginSnackBar,
}: {
  isOpenBlockMultiLoginSnackBar: boolean;
  setIsOpenBlockMultiLoginSnackBar: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}) => {
  const handleClose = async (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    setIsOpenBlockMultiLoginSnackBar(false);
  };

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose} />
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      open={isOpenBlockMultiLoginSnackBar}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      sx={{
        "& .MuiSnackbarContent-root": {
          position: "relative",
          paddingRight: "48px", // ボタン分のスペースを確保
        },
      }}
      message={
        "異なるセッションIDが確認されたので自動的にログアウトしました。同時にログインできるのは1つのアカウントにつき一人までです。また、アカウントの複数人での共有は規約で禁止されています。心当たりがない場合はサポートまでお問い合わせください。"
      }
      action={action}
    />
  );
};
