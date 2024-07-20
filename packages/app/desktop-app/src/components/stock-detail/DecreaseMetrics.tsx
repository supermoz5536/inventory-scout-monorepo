import {
  Table as MUITable,
  Card,
  CardContent,
  Grid,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const DecreaseMetrics = ({ data }: StockDetailProps) => {
  const [totalDecrease, settotalDecrease] = useState<number>(0);
  const [dayAverage, setDayAverage] = useState<number>(0);
  const columnHeader = ["全体在庫の減少数", "日次", "週次", "月次"];
  const decreaseMetricsData = [
    {
      在庫変動数: totalDecrease,
      日次: dayAverage,
      週次: dayAverage * 7,
      月次: dayAverage * 30,
    },
  ];
  let decreaseCount: number = 0;
  let increaseCount: number = 0;

  useEffect(() => {
    const result = data.reduce(
      (acc: number, currentData: any, index: number, array: any) => {
        if (index === 0) return acc; // 最初の要素には前日がないためスキップ

        // 現在処理してる日付のオブジェクトとその前の日のオブジェクトの差分をとる
        const prevData = array[index - 1];
        const currentTotalStock = currentData["FBA全体在庫"] ?? null;
        const prevTotalStock = prevData["FBA全体在庫"] ?? null;

        // ■ 各セラーでの増加（補充）フィルター処理
        // オブジェクト内の "FBA全体在庫"以外の全てのセラーキーを取得し
        // 「currentStock」「prevStock」を算出して
        // そのうち一人でも、在庫が増えてるセラーがいたら
        // ++increaseCount; を実行してスキップ
        // イテレートな処理で真偽値が帰ってくるようにすればいい
        const keys = Object.keys(currentData).filter(
          (key) => key !== "FBA全体在庫" && key !== "date"
        );
        // console.log("keys =", keys);
        const isDecreaseAll = keys.every((key) => {
          // console.log("key =", key);
          const prevSellerStock = prevData[key] ?? null;
          const currentSellerStock = currentData[key] ?? null;
          // console.log("prevData =", prevData[key]);
          // console.log("currentSellerStock =", currentSellerStock[key]);
          return (
            prevSellerStock &&
            currentSellerStock &&
            prevSellerStock >= currentSellerStock
          );
        });

        // console.log("isDecreaseAll =", isDecreaseAll);
        if (!isDecreaseAll && prevData["FBA全体在庫"] !== null) {
          ++increaseCount;
          return acc;
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
          // } else {
          //   // 増加（補充）の場合はスキップ
          //   ++increaseCount;
          //   return acc;
          // }
        } else {
          // "FBA全体在庫" の値が
          // 前日と当日のどちらかで欠けてる場合はスキップ
          return acc;
        }
      },
      0
    );

    console.log("result =", result);
    console.log("decreaseCount =", decreaseCount);
    console.log("increaseCount =", increaseCount);

    // 日次の平均減少数を算出する、その際に
    // 指定期間の最初の日付はスキップしてるので -1 する。
    // 算出した値を増加日をスキップした回数分だけ加える。
    // これで増加日の減少数を
    // 日次の平均減少数シミュレートしたことになる。
    const newDayAverage = result / decreaseCount;
    console.log("newDayAverage =", newDayAverage);
    const newTotalDecrease = result + newDayAverage * increaseCount;
    // Math.round : 小数点以下を四捨五入
    setDayAverage(Math.round(newDayAverage));
    settotalDecrease(Math.round(newTotalDecrease));
  }, [data]);

  return (
    <div>
      <TableContainer
        component={Paper}
        sx={{
          marginTop: 5,
          marginBottom: 0,
          marginLeft: 8,
          padding: "12px", // パディング
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)", // 影のスタイル
          backgroundColor: "#FEFEFE", // 背景色
          borderRadius: "0px", // 角の丸み
        }}
      >
        <MUITable>
          <TableHead>
            <TableRow>
              {columnHeader.map((column) => (
                <TableCell
                  key={column}
                  sx={{
                    maxHeight: "5px",
                    minWidth: "40px",
                    padding: "4px", // Padding adjustment
                    lineHeight: "1rem", // Line height adjustment
                    border: "1px solid #ccc", // Border style
                    textAlign: "center", // Center align text
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {decreaseMetricsData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <TableCell
                    key={colIndex}
                    sx={{
                      minWidth: "10px",
                      padding: "4px", // Padding adjustment
                      lineHeight: "1rem", // Line height adjustment
                      border: "1px solid #ccc", // Border style
                      textAlign: "center", // Center align text
                    }}
                  >
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MUITable>
      </TableContainer>
    </div>
  );
};

export default DecreaseMetrics;
