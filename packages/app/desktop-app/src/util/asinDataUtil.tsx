import React from "react";

export const getPrevScrapingDate = (asinData: AsinData) => {
  const stockCountDatas = asinData.fbaSellerDatas[0].stockCountDatas;

  // flatMapは、配列の各要素にObject.keysを適用し、
  // 各結果を格納した配列を生成、フラット化して出力します。
  const array = stockCountDatas.flatMap(Object.keys);

  // 最新の1つ前のデータが前回取得なので
  // 配列の最後から2番目のindexを指定します。
  const prevScrapingDate = array[array.length - 2];

  return prevScrapingDate;
};
