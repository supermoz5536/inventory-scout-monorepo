import React from "react";

export const calculateRemainingTime = (asinDataList: AsinData[]) => {
  // asinDataListRef.currentをイテレート処理
  // isScraping === trueの要素の時に
  // const isScrapingCount をインクリメント
  // 要素1つにつき１分なのでそのまま
  const isScrapingTrueCount: number = asinDataList.reduce(
    (acc: number, asinData: AsinData) => {
      return asinData.isScraping === true ? ++acc : acc;
    },
    0
  );

  const isScrapingNullCount: number = asinDataList.reduce(
    (acc: number, asinData: AsinData) => {
      return asinData.isScraping === null ? ++acc : acc;
    },
    0
  );

  // 1ASINあたり1.5分の計算
  const remainingTime = Math.floor(
    (isScrapingTrueCount + isScrapingNullCount) * 1.5
  );

  return remainingTime;
};
