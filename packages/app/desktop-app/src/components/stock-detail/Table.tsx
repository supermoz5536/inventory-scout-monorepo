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
  console.log("columnHeader =", columnHeader);
  console.log("data =", data);

  return (
    <TableContainer component={Paper}>
      <MUITable>
        <TableHead>
          <TableRow>
            {columnHeader!.map((column) => (
              <TableCell key={column}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row: any, rowIndex: any) => (
            <TableRow key={rowIndex}>
              {columnHeader!.map((column) => (
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
