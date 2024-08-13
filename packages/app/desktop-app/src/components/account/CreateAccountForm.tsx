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
          アカウントにログイン
        </DialogTitle>
        <DialogContent></DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateAccountForm;
