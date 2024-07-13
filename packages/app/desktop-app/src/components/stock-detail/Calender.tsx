import React, { useEffect, useState } from "react";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField, Popover, Box, InputAdornment } from "@mui/material";
import { subDays } from "date-fns";
import jaLocale from "date-fns/locale/ja";
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
    // LocalizationProvider は
    // スコープないの全ての日付ピッカーコンポーネント (DatePicker等)に
    // 設定を与えることで、一元管理の機能を果たします。

    // dateAdapter プロパティは、
    // 日付操作のためのライブラリを指定します。(date-fns等)

    // AdapterDateFnsをpropsで渡す理由は
    // LocalizationProviderで日付操作のためのライブラリを設定し
    // 日付ピッカーコンポーネントで使えるようにするためです
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={jaLocale}>
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        className="custom-calendar"
      >
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
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          // slotProps は MUI コンポーネントのスロット（内部要素）に
          // カスタムプロパティやスタイルを適用するために使用されます。
          slotProps={{
            // Paper 要素は カード、ポップオーバーなどの
            // コンテナに関わる設定に使用されます。
            paper: {
              // sx要素で全体の場所を移動します。
              sx: {
                mt: 2,
              },
            },
          }}
          // カスタムスタイルを適用
          sx={{
            // & は「このスタイルが適用されている要素」、つまり
            // StaticDatePicker コンポーネントを指します。
            // したがって、このスタイルは StaticDatePicker コンポーネント内の
            // .MuiPickersDay-today クラスを持つ全ての要素に対して適用されます。
            "& .MuiPickersDay-today": {
              border: "none",
            },
          }}
        >
          <Box p={2}>
            {currentPicker === "start" ? (
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={startDate}
                onChange={handleDateChange}
              />
            ) : (
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={endDate}
                onChange={handleDateChange}
              />
            )}
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default Calender;
