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

// stripeAPIから取得したUnixタイムスタンプ形式の月額プラン解約予定日のデータを
// ISOの国際標準時間形式に変換する関数
// Unixタイムスタンプ形式: この形式は、1970年1月1日00:00:00 UTCからの経過秒数を表示します。
// ISO: 一般的な時間表示形式です。
export const convertTimeStampFromUnixToStandard = (cancelAt: string) => {
  const cancelAtAsDate = new Date(Number(cancelAt) * 1000); // ミリ秒に変換

  // 日本の一般的な形式で表示
  const formattedCancelAtDate = cancelAtAsDate.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formattedCancelAtDate;
};
