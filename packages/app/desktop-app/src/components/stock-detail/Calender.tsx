import React, { useState } from "react";
import Calendar from "react-calendar";
import { TextField, Popover, Box } from "@mui/material";
import "react-calendar/dist/Calendar.css";
import "./CustomCalender.css";

const Calender = ({ onChange }: StockDetailProps) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [currentPicker, setCurrentPicker] = useState(null);

  const handleOpen = (event: any, pickerType: any) => {
    setAnchorEl(event.currentTarget);
    setCurrentPicker(pickerType);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentPicker(null);
  };

  const handleDateChange = (date: any) => {
    if (currentPicker === "start") {
      setStartDate(date);
      if (onChange) onChange([startDate, endDate]);
    } else {
      setEndDate(date);
      if (onChange) onChange([startDate, endDate]);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "calendar-popover" : undefined;

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <TextField
        label="開始日"
        value={startDate.toLocaleDateString("ja-JP")}
        onClick={(e) => handleOpen(e, "start")}
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="終了日"
        value={endDate.toLocaleDateString("ja-JP")}
        onClick={(e) => handleOpen(e, "end")}
        InputProps={{
          readOnly: true,
        }}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box p={2}>
          <Calendar
            onChange={handleDateChange}
            value={currentPicker === "start" ? startDate : endDate}
          />
        </Box>
      </Popover>
    </Box>
  );
};

export default Calender;

// const Calender = ({ onChange }: StockDetailProps) => {
//     const [value, setValue] = useState<Date | undefined>();

//     return (
//       <div>
//         <Calendar value={value} onClickDay={(date: Date) => setValue(date)} />
//         <div>{value ? value.toDateString() : "No date selected"}</div>
//       </div>
//     );
//   };
