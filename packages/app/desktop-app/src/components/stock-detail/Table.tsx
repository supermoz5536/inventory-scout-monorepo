import React from "react";
import {
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const Table = ({ columnHeader, data }: StockDetailProps) => {
  const safecolumnHeader = columnHeader ? columnHeader : [];
  const safeData = data ? data : [];

  return (
    <TableContainer component={Paper}>
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

// export const Table = ({ columnHeader, data }: StockDetailProps) => {
//   return <div>Table</div>;
// };
