import React from "react";

/// asinDataオブジェクトを受け取り、
/// 当日と前日の合計在庫の差分を出力する関数
export const calculateDecreaseTodayToYesterday = (asinData: AsinData) => {
  // 当日の合計在庫、求める値は
  // fbaSellerDatasの各オブジェクト（セラー）ごとの
  // stockCountDatas プロパティに保持している配列のなかの
  // キーが当日(配列の最後のオブジェクト)の値の合計
  const totalStockLatest: number | null = asinData.totalStock;

  // 前日の合計在庫、求める値は同様にして
  // キーが前日(配列の最後から遡って２番目のオブジェクト)の値の合計
  const totalStockPrevOneEl: number | null = asinData.fbaSellerDatas.reduce(
    (acc, currentSellerData) => {
      const length = currentSellerData.stockCountDatas.length;

      if (currentSellerData.stockCountDatas.length >= 2) {
        const yesterdayObj = currentSellerData.stockCountDatas[length - 2];
        const key = Object.keys(yesterdayObj);
        const stockYesterday = yesterdayObj[key[0]];
        return acc + stockYesterday;
      }

      return acc;
    },
    0
  );

  if (totalStockLatest && totalStockPrevOneEl) {
    const difference = totalStockPrevOneEl - totalStockLatest;
    return difference;
  } else {
    return -1;
  }
};

/// asinDataオブジェクトを受け取り、
/// 当日と前日の合計在庫の差分を出力する関数
export const calculateDecreaseTodayTo7DaysAgo = (asinData: AsinData) => {
  // 当日の合計在庫、求める値は
  // fbaSellerDatasの各オブジェクト（セラー）ごとの
  // stockCountDatas プロパティに保持している配列のなかの
  // キーが当日(配列の最後のオブジェクト)の値の合計
  const totalStockLatest: number | null = asinData.totalStock;

  // 前日の合計在庫、求める値は同様にして
  // キーが前日(配列の最後から遡って２番目のオブジェクト)の値の合計
  const totalStockPrevSevenEl: number | null = asinData.fbaSellerDatas.reduce(
    (acc, currentSellerData) => {
      const length = currentSellerData.stockCountDatas.length;

      if (currentSellerData.stockCountDatas.length > 8) {
        const YesterdayObj = currentSellerData.stockCountDatas[length - 8];
        const key = Object.keys(YesterdayObj);
        const stockYesterday = YesterdayObj[key[0]];
        return acc + stockYesterday;
      }

      return acc;
    },
    0
  );

  if (totalStockPrevSevenEl && totalStockLatest) {
    const difference = totalStockPrevSevenEl - totalStockLatest;
    return difference;
  } else {
    return -1;
  }
};
