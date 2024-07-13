import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { TextField, Popover, Box, InputAdornment } from "@mui/material";
import { subDays } from "date-fns";
import "react-calendar/dist/Calendar.css";
import { CgCalendarToday } from "react-icons/cg";

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
    // ポップオーバー（カレンダー）表示に必要な
    // アンカー要素（基準となる要素）を設定します。
    setAnchorEl(event.currentTarget);
    // 現在選択されているピッカーの種類を設定します。
    // 例えば、開始日を選択する場合は"start"、
    // 終了日を選択する場合は"end"になります。
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

  return (
    <Box display="flex" alignItems="center" gap={2} className="custom-calendar">
      <TextField
        label="開始日"
        // toLocaleDateString: Date型のobjを日本語の日付形式で表示します。
        value={startDate.toLocaleDateString("ja-JP")}
        onClick={(e) => handleOpen(e, "start")}
        InputProps={{
          readOnly: true,
          sx: {
            height: 35,
            width: 116,
            paddingTop: 0.5,
          },
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{
                marginTop: -0.25,
                marginLeft: -0.5,
                marginRight: 0.5,
              }}
            >
              <CgCalendarToday />
            </InputAdornment>
          ),
        }}
        sx={{ marginTop: 3, marginLeft: 115, marginBottom: 3 }}
      />
      <TextField
        label="終了日"
        value={endDate.toLocaleDateString("ja-JP")}
        onClick={(e) => handleOpen(e, "end")}
        InputProps={{
          readOnly: true,
          sx: {
            height: 35,
            width: 116,
            paddingTop: 0.5,
          },
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{
                marginTop: -0.25,
                marginLeft: -0.5,
                marginRight: 0.5,
              }}
            >
              <CgCalendarToday />
            </InputAdornment>
          ),
        }}
        sx={{ marginTop: 3, marginBottom: 3 }}
      />
      <Popover
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
