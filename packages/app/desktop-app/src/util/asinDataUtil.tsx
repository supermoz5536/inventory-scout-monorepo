import React from "react";

export const getPrevScrapingDate = (asinData: AsinData) => {
  try {
    let stockCountDatas;
    let array: string[];
    let prevScrapingDate = "";

    if (
      // fbaSellerDatasの初期値は[]なので考慮に入れる
      // 前回取得が存在する条件は2つ以上の取得があること
      asinData.fbaSellerDatas.length > 0 &&
      asinData.fbaSellerDatas[0].stockCountDatas.length >= 2
    ) {
      // flatMapは、配列の各要素にObject.keysを適用し、
      // 各結果を格納した配列を生成、フラット化して出力します。
      stockCountDatas = asinData.fbaSellerDatas[0].stockCountDatas;
      array = stockCountDatas.flatMap(Object.keys);
      prevScrapingDate = array[array.length - 2];
      return prevScrapingDate;
    }
  } catch (error) {
    console.log("getPrevScrapingDate", error);
  }
};
