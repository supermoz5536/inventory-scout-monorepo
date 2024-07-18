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
import React from "react";

const DecreaseMetrics = () => {
  const columnHeader = ["全体在庫の減少数", "日次", "週次", "月次"];
  const data = [{ 在庫変動数: 10, 日次: 3, 週次: 21, 月次: 90 }];

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
            {data.map((row, rowIndex) => (
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
