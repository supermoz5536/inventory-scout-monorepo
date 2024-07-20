import React from "react";
import {
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  Grid,
} from "@mui/material";

const Table = ({ columnHeader, data }: StockDetailProps) => {
  const safecolumnHeader = columnHeader ? columnHeader : [];
  const safeData = data ? data : [];

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <TableContainer
      component={Paper}
      elevation={2}
      // variant="outlined"
      square
      sx={{
        width: 1083.5,
        height: 300,
        marginLeft: 8,
        marginBottom: 0,
        // bgcolor: "background.paper", // 背景色を設定
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)", // 影のスタイル
        backgroundColor: "#FEFEFE", // 背景色
        padding: "16px", // パディング
        borderRadius: "0px", // 角の丸み
      }}
    >
      <MUITable>
        <TableHead>
          <TableRow>
            {safecolumnHeader.map((column) => (
              <TableCell key={column}>
                {column.includes("-") ? formatDate(column) : column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {safeData.map((row: any, rowIndex: any) => (
            <TableRow key={rowIndex}>
              {safecolumnHeader.map((column) => (
                <TableCell key={column}>{row[column]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MUITable>
    </TableContainer>
  );
};

export default Table;
