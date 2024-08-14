import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  TextField,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { SubmitHandler, useForm } from "react-hook-form";

const CreateAccountForm = ({
  isOpenCreateAccountFormDialog,
  setIsOpenCreateAccountFormDialog,
}: {
  isOpenCreateAccountFormDialog: boolean;
  setIsOpenCreateAccountFormDialog: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}) => {
  const handleOpen = () => {
    setIsOpenCreateAccountFormDialog(true);
  };
  const handleClose = () => {
    setIsOpenCreateAccountFormDialog(false);
  };
  return (
    <React.Fragment>
      <Dialog open={isOpenCreateAccountFormDialog} onClose={handleClose}>
        <DialogTitle
          sx={{
            marginLeft: "35px",
            marginBottom: "0px",
            fontSize: "25px",
            fontWeight: "bold",
          }}
        >
          アカウントの作成
        </DialogTitle>
        <DialogContentText>
          <p>永久プランの購入にはアカウントが必要です。</p>
        </DialogContentText>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="メールアドレス"
            type="email"
            fullWidth
            variant="standard"
            // value={inputEmail}
            // onChange={handleInputEmailChange}
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="パスワード"
            // type={isVisiblePassword ? "text" : "password"}
            fullWidth
            variant="standard"
            // value={inputPassword}
            // onChange={handleInputPasswordChange}
          />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateAccountForm;
