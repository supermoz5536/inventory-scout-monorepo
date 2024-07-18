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

const Chart = ({ data }: StockDetailProps) => {
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

  return (
    <>
      <LineChart
        width={1170}
        height={300}
        data={data}
        margin={{
          top: 0,
          right: 0,
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
            strokeWidth={index === 0 ? 1.5 : 0.5}
          />
        ))}
        <Legend wrapperStyle={{ paddingTop: 10, paddingBottom: 7.5 }} />
        <Tooltip />
      </LineChart>
    </>
  );
};

export default Chart;
