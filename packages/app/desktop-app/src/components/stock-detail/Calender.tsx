import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { TextField, Popover, Box } from "@mui/material";
import { subDays } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "./CustomCalender.css";

const Calender = ({ onChange }: StockDetailProps) => {
  // 本日のDateオブジェクト
  const today: Date = new Date();
  // 7日前のDateオブジェクト
  const sevenDaysAgo: Date = subDays(today, 7);

  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
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
      // UIの更新
      setStartDate(date);
      // 親コンポーネントの変数を変更
      if (onChange) onChange([date, endDate]);
    } else {
      setEndDate(date);
      if (onChange) onChange([startDate, date]);
    }
    handleClose();
  };

  useEffect(() => {
    if (onChange) {
      onChange([startDate, endDate]);
    }
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "calendar-popover" : undefined;

  return (
    <Box display="flex" alignItems="center" gap={2} className="custom-calendar">
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
