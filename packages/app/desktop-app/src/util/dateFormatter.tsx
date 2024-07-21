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
