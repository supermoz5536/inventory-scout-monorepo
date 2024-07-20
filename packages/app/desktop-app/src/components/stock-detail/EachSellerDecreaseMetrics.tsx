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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const EachSellerDecreaseMetrics = ({
  data,
  setSelectedSellerIndex,
}: StockDetailProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [totalDecrease, setTotalDecrease] = useState<number>(0);
  const [dayAverage, setDayAverage] = useState<number>(0);
  const columnHeader = ["space-holder", "日次", "週次", "月次"];
  const decreaseMetricsData = [
    {
      在庫変動数: totalDecrease,
      日次: dayAverage,
      週次: dayAverage * 7,
      月次: dayAverage * 30,
    },
  ];
  const keys = Array.from(
    new Set(
      data.flatMap((item: any) =>
        Object.keys(item).filter(
          (key) => key !== "FBA全体在庫" && key !== "date"
        )
      )
    )
  );
  const keysFixed = ["　", ...keys];

  let decreaseCount: number = 0;
  let increaseCount: number = 0;

  // ========================================================================

  useEffect(() => {
    if (selectedIndex === 0) {
      setTotalDecrease(0);
      setDayAverage(0);
    }
  }, [data, selectedIndex]);

  // ========================================================================

  const handleMenu = (event: any) => {
    setSelectedIndex(event.target.value);
    if (setSelectedSellerIndex) {
      setSelectedSellerIndex(event.target.value);
    }
  };

  return (
    <div>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "375px",
          marginTop: 3.25,
          marginBottom: 0,
          marginLeft: 10,
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
                <TableCell
                  key={column}
                  sx={{
                    maxHeight: "5px",
                    maxWidth: "120px", // Select自体の横を設定
                    minWidth: "40px",
                    paddingY: "4px", // Padding adjustment
                    paddingX: "4px", // Padding adjustment
                    lineHeight: "1rem", // Line height adjustment
                    border: "1px solid #ccc", // Border style
                    textAlign: "center", // Center align text
                  }}
                >
                  {index === 0 ? (
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label"></InputLabel>
                      <Select
                        value={selectedIndex}
                        onChange={(event) => {
                          handleMenu(event);
                        }}
                        sx={{
                          height: "30px", // Select自体の高さを設定
                          width: "150px", // Select自体の横を設定
                          maxHeight: "30px", // Select自体の高さを設定
                          maxWidth: "150px", // Select自体の横を設定
                        }}
                      >
                        {keysFixed.map((key: any, sellerIndex) => {
                          return (
                            <MenuItem
                              value={sellerIndex}
                              sx={{
                                maxWidth: "120px", // Select自体の横を設定
                              }}
                            >
                              {key}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  ) : (
                    column
                  )}
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

export default EachSellerDecreaseMetrics;
