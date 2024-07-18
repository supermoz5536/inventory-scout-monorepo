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

  return (
    <TableContainer
      component={Paper}
      elevation={2}
      // variant="outlined"
      square
      sx={{
        width: 1087.5,
        height: 300,
        marginLeft: 8,
        marginBottom: 1,
        bgcolor: "background.paper", // 背景色を設定
      }}
    >
      <MUITable>
        <TableHead>
          <TableRow>
            {safecolumnHeader.map((column) => (
              <TableCell key={column}>{column}</TableCell>
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
