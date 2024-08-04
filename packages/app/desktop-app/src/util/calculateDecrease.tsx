import React from "react";
import { format, parseISO, subDays } from "date-fns";
import { resetTime } from "./dateFormatter";

/// asinDataオブジェクトを受け取り、
/// 当日と前日の合計在庫の差分を出力する関数
export const calculateDecreaseLatestToPrevEl = (asinData: AsinData) => {
  // try {
  // 当日の合計在庫、求める値は
  // fbaSellerDatasの各オブジェクト（セラー）ごとの
  // stockCountDatas プロパティに保持している配列のなかの
  // キーが当日(配列の最後のオブジェクト)の値の合計
  const totalStockLatest: number | null = asinData.totalStock;
  // 前日の合計在庫、求める値は同様にして
  // キーが前日(配列の最後から遡って２番目のオブジェクト)の値の合計
  const totalStockPrevEl: number | null = asinData.fbaSellerDatas.reduce(
    (acc, currentSellerData) => {
      const length = currentSellerData.stockCountDatas.length;

      if (currentSellerData.stockCountDatas.length >= 2) {
        const prevElObj = currentSellerData.stockCountDatas[length - 2];
        const key = Object.keys(prevElObj);
        let stockPrevOneEl = prevElObj[key[0]];

        // 呼び出し元はTopコンポーネントで、
        // 取得不可の在庫の値はフラグ値としての -1 のままなので
        // 合算の例外として処理するために 0で計算
        if (stockPrevOneEl === -1) stockPrevOneEl = 0;
        return acc + stockPrevOneEl;
      }

      return acc;
    },
    0
  );

  if (totalStockLatest && totalStockPrevEl) {
    const difference = totalStockPrevEl - totalStockLatest;
    return difference;
  } else {
    return -1;
  }
  // } catch (error) {
  //   console.log("■ calculateDecreaseLatestToPrevEl error", error);
  // }
};

/// asinDataオブジェクトを受け取り、
/// 当日から遡って７日間の在庫数の変動出力する関数
/// 補足①：増加（補充）された日は、減少した日の平均値に差し替える
/// 補足②：取得データの無い日は考慮しない。
export const prepareDataForCalculateDecrease = (
  asinData: AsinData,
  dateRange?: [Date, Date]
) => {
  let startDate: Date;
  let endDate: Date;

  if (dateRange) {
    // ① 変更された日付範囲において、各日のオブジェクトを処理
    startDate = resetTime(new Date(dateRange[0]));
    endDate = resetTime(new Date(dateRange[1]));
  } else {
    // 7日前のオブジェクト作成
    startDate = resetTime(new Date());
    startDate.setDate(startDate.getDate() - 7);
    // 本日のオブジェクトを作成
    endDate = resetTime(new Date());
  }

  let newDataList: any[] = [];
  let currentDate = new Date(startDate); // startDateのコピーを作成

  // 日付のキーと値だけ設定されてる
  // チャートの各グリッドに割り当てるデータを用意
  while (currentDate <= endDate) {
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    let newCurrentDayData: any = { date: formattedDate };

    // 必要な情報は
    // 各日付(currentDate)に対して
    // 各セラーのstockCountDatas配列内の要素で
    // currentDateと一致するキーを持つオブジェクトを見つけ
    // セラー名をキーとするプロパティを追加して、そのキーの値(在庫数)を代入
    asinData.fbaSellerDatas.forEach((fbaSellerData) => {
      return fbaSellerData.stockCountDatas.forEach(
        (stockCountData: StockCountData) => {
          if (Object.keys(stockCountData)[0] === formattedDate) {
            newCurrentDayData[fbaSellerData.sellerName] =
              stockCountData[formattedDate];
          }
        }
      );
    });

    // 最後にASIN全体の在庫分のチャートライン用データを用意する
    // dateキーを除く全てのキーを取得し
    const keysWithoutDate: string[] = Object.keys(newCurrentDayData).filter(
      (key) => key !== "date"
    );

    // それぞれの値を合計する
    const totalStock: number | null = keysWithoutDate.reduce((acc, key) => {
      // 在庫取得に失敗した際フラグ -1 の場合は
      // 計算から外した上で
      // チャートの在庫数に-1が表示されないようにnullを設定
      if (newCurrentDayData[key] === -1) {
        newCurrentDayData[key] = null;
        return acc;
      } else {
        return acc + newCurrentDayData[key];
      }
    }, null);

    // 同じくnewChartDataの新規プロパティ("在庫合計")に値を代入する
    newCurrentDayData = { FBA全体在庫: totalStock, ...newCurrentDayData };

    // 該当の日付の各セラーの販売数を格納したオブジェクトを
    // Chartコンポーネントに渡す配列に追加
    newDataList.push(newCurrentDayData);

    // 次の日付の処理へ
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return newDataList;
};

export const calculateDataForChart = (data: any, offSet: boolean) => {
  // 引数のoffSet: 一部コンポーネントで "-" の在庫数減少に対する例外処理が必要な場合に利用
  // true: DecreaseMetrics, Top (例外を追記)

  let decreaseCount: number = 0;
  let increaseCount: number = 0;

  const result = data.reduce(
    (acc: number, currentData: any, index: number, array: any) => {
      if (index === 0) return acc; // 最初の要素には前日がないためスキップ

      // 現在処理してる日付のオブジェクトとその前の日のオブジェクトの差分をとる
      const prevData = array[index - 1];
      let currentTotalStock = currentData["FBA全体在庫"] ?? null;
      let prevTotalStock = prevData["FBA全体在庫"] ?? null;

      // ■ 各セラーでの増加（補充）フィルター処理
      // オブジェクト内の "FBA全体在庫"以外の全てのセラーキーを取得し
      // 「currentStock」「prevStock」を算出して
      // そのうち一人でも、在庫が増えてるセラーがいたら
      // ++increaseCount; を実行してスキップ
      // イテレートな処理で真偽値が帰ってくるようにすればいい
      const keys = Object.keys(currentData).filter(
        (key) => key !== "FBA全体在庫" && key !== "date"
      );
      // セラー内(各要素)に
      // １人でも在庫の増加がある場合(someメソッド)は
      // isIncreaseをTrueにする
      const isIncrease = keys.some((key) => {
        const prevSellerStock = prevData[key] ?? null;
        const currentSellerStock = currentData[key] ?? null;

        // prevSellerStock や currentSellerStock が null である場合は
        // 比較を回避する条件を明確に設定する
        // 理由は、null や undefined が数値として扱われると、
        // 意図しない比較結果が生じ、isIncraaseがtrueになるリスクがあるので
        // 例外処理が必要

        // ifで例外処理：当日の値 or 前日の値のいずれかがnullだった場合は、
        // いずれかの日の値の取得に失敗している例外なので
        // isIncrease は false にする。
        if (prevSellerStock === null || currentSellerStock === null) {
          return false;
        }

        // 当日の値と前日の値が両方存在し
        // かつ
        // 増加してる場合のみ isIncrease を True にする
        return (
          prevSellerStock &&
          currentSellerStock &&
          prevSellerStock < currentSellerStock
        );
      });
      if (isIncrease && prevData["FBA全体在庫"] !== null) {
        ++increaseCount;
        return acc;
      }

      // DecreaseMetrics, Topでは
      // "-" による減少数を在庫の減少としてカウントしないように
      // 減少分(前日の在庫数)を加えて、±0で相殺する
      // 減少分として計算自体は行っているので
      // decreaseCountをあらかじめデクリメントしておく
      if (offSet === true) {
        // ■ currentTotalStock の更新
        // 「実際の値」 →　" - " の場合
        currentTotalStock = keys.reduce((acc: any, key) => {
          let tempPrevSellerStock = prevData[key] ?? null;
          let tempCurrentSellerStock = currentData[key] ?? null;

          if (
            tempPrevSellerStock &&
            tempCurrentSellerStock === null &&
            currentTotalStock !== null
          ) {
            tempCurrentSellerStock = tempPrevSellerStock;
          }
          return acc + tempCurrentSellerStock;
        }, 0);

        // ■ prevTotalStock の更新
        // " - " → 「実際の値」 の場合
        prevTotalStock = keys.reduce((acc: any, key) => {
          let tempPrevSellerStock = prevData[key] ?? null;
          let tempCurrentSellerStock = currentData[key] ?? null;

          if (
            tempPrevSellerStock === null &&
            tempCurrentSellerStock &&
            prevTotalStock !== null
          ) {
            tempPrevSellerStock = tempCurrentSellerStock;
          }
          return acc + tempPrevSellerStock;
        }, 0);
      }

      // ■ 合算処理
      // 増加（補充）してるセラーがいない
      // かつ
      // "FBA全体在庫" の値が前日と当日にある
      // その場合は合算処理
      if (
        prevTotalStock &&
        currentTotalStock &&
        prevTotalStock >= currentTotalStock
      ) {
        const difference = prevTotalStock - currentTotalStock;
        // if (difference >= 0) {
        // 減少 or 同じ値の場合
        ++decreaseCount;
        return (acc = acc + difference);
      } else {
        // "FBA全体在庫" の値が
        // 前日と当日のどちらかで欠けてる場合はスキップ
        return acc;
      }
    },
    0
  );

  // 日次の平均減少数を算出する、その際に
  // 指定期間の最初の日付はスキップしてるので -1 する。
  // 算出した値を増加日をスキップした回数分だけ加える。
  // これで増加日の減少数を
  // 日次の平均減少数シミュレートしたことになる。
  const newDayAverage = result / decreaseCount;
  const newTotalDecrease = result + newDayAverage * increaseCount;

  // Math.round : 小数点以下を四捨五入
  return {
    newDayAverage: Math.round(newDayAverage),
    newTotalDecrease: Math.round(newTotalDecrease),
  };
};
