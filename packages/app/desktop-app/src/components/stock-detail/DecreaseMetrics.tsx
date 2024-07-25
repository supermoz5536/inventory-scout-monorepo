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
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { calculateDataForChart } from "../../util/calculateDecrease";

const DecreaseMetrics = ({ data }: StockDetailProps) => {
  const [totalDecrease, setTotalDecrease] = useState<number>(0);
  const [dayAverage, setDayAverage] = useState<number>(0);
  const columnHeader = ["FBA全体在庫の減少数", "日次", "週次", "月次"];
  const decreaseMetricsData = [
    {
      在庫変動数: totalDecrease,
      日次: dayAverage,
      週次: dayAverage * 7,
      月次: dayAverage * 30,
    },
  ];

  useEffect(() => {
    setDayAverage(calculateDataForChart(data, true).newDayAverage);
    setTotalDecrease(calculateDataForChart(data, true).newTotalDecrease);
  }, [data]);

  return (
    <div>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "350px",
          marginTop: 3.25,
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
              {columnHeader.map((column, index) => (
                <Tooltip
                  title={
                    index === 0
                      ? "FBAセラー全体の指定期間内の在庫減少数の推測値です。在庫の増加するセラーがいる日付では、１日あたりの平均減少数(右隣の日次)の値に差し替えて計算しています。"
                      : index === 1
                      ? "指定期間内の１日あたりの減少数の平均値です。"
                      : index === 2
                      ? "指定期間内の1週間あたりの減少数の平均値です。"
                      : "指定期間内の1ヶ月あたりの減少数の平均値です。"
                  }
                  placement="top"
                  arrow
                  PopperProps={{
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -5], // ここでピクセル単位で位置を調整
                        },
                      },
                    ],
                  }}
                >
                  <TableCell
                    key={column}
                    sx={{
                      height: "35px",
                      maxHeight: "5px",
                      minWidth: "40px",
                      padding: "4px", // Padding adjustment
                      lineHeight: "1rem", // Line height adjustment
                      border: "1px solid #ccc", // Border style
                      textAlign: "center", // Center align text
                      color: index === 0 ? "#ff0092" : null,
                    }}
                  >
                    {column}
                  </TableCell>
                </Tooltip>
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
                      height: "16px",
                      minWidth: "20px",
                      paddingY: "4px", // Padding adjustment
                      lineHeight: "1rem", // Line height adjustment
                      border: "1px solid #ccc", // Border style
                      textAlign: "center", // Center align text
                    }}
                  >
                    {/* {value} */}
                    {Number.isNaN(value) ? "N/A" : value}
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
