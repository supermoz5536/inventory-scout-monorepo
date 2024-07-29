import { Box } from "@mui/material";
import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Chart = ({ data, selectedSellerIndex }: StockDetailProps) => {
  // date以外のキーを取得して、出品者全員のキーを格納した配列を得る。
  // data.flatMapを使用して、data内のすべてのオブジェクトのキーを収集します。
  // filter(key => key !== 'date')でdateキーを除外します。
  // new Setを使用して重複するセラー名を排除し、ユニークなセラー名の集合を作成します。
  // Array.fromで集合を配列に変換します。
  const keys = Array.from(
    new Set(
      data.flatMap((item: any) =>
        Object.keys(item).filter((key) => key !== "date")
      )
    )
  );

  const colors = [
    "#ff0092",
    "#8884d8",
    "#3ba2f6",
    "#82ca9d",
    "#ff8042",
    "#ffbb28",
    "#a4de6c",
    "#d0ed57",
    "#8dd1e1",
    "#d885f7",
  ];

  // データの長さに応じてチャートの幅を決定する
  const chartWidth = Math.max(1180, data.length * 60);
  return (
    <>
      <Box
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          width: 1180,
        }}
      >
        <Box sx={{ minWidth: 1180, width: chartWidth }}>
          <LineChart
            width={chartWidth} // データ数に応じて幅を動的に変更
            height={340}
            data={data}
            margin={{
              top: 20,
              right: 10,
              left: 5,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              interval={0}
              dx={-2.5}
              dy={7.5}
              tick={{
                fontSize: 12,
                fill: "#666666",
              }}
              tickSize={5} // メモリのサイズを調整
              tickMargin={5} // メモリとラベルの間隔を調整
              tickFormatter={(tick) => {
                // ラベルのフォーマットを調整して、表示内容を短縮
                const date = new Date(tick);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              label={{ value: "在庫数", angle: -90, position: "insideLeft" }}
            />

            {keys.map((key: any, index: any) => (
              <Line
                key={index}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]} // 配列の色を順番に使う
                strokeWidth={
                  index === 0 && selectedSellerIndex === 0
                    ? 1.75
                    : index === 0 && selectedSellerIndex !== 0
                    ? 0.2
                    : index === selectedSellerIndex!
                    ? 2
                    : 0.3
                }
              />
            ))}
            <Legend
              wrapperStyle={{
                paddingTop: 10,
                paddingBottom: 7.5,
              }}
            />
            <Tooltip />
          </LineChart>
        </Box>
      </Box>
    </>
  );
};

export default Chart;
