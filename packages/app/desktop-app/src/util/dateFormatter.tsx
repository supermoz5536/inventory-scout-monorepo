import React from "react";

// startDateとendDateの時間部分をリセットする関数
export const resetTime = (date: Date) => {
  date.setHours(0, 0, 0, 0);
  return date;
};

export const convertDateToString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// export const getTommorowDate = () => {
//   const newDate = new Date(); // 元の日付をコピー
//   newDate.setDate(newDate.getDate() + 1); // 日付を1日加算
//   return newDate;
// };
