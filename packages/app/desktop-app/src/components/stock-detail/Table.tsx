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
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const Table = ({ columnHeader, data }: StockDetailProps) => {
  const safecolumnHeader = columnHeader ? columnHeader : [];
  const safeData = data ? data : [];

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 日付文字列を1日前にする関数
  const getPreviousDateString = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
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
                {column.includes("-") ? (
                  formatDate(column)
                ) : (
                  <Tooltip
                    title="各セラーの日付別の在庫数一覧です。カート画面の同時販売個数に「999」を設定した際の表示値を集計しています。数量制限を設定しているセラーの在庫数は取得不可で - で表示されます。"
                    arrow
                    placement="right"
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
                    <IconButton
                      sx={{
                        marginTop: "-45px",
                        marginLeft: "-32px",
                        width: "35px", // 必要に応じて幅を固定
                        height: "35px", // 必要に応じて高さを固定
                        borderRadius: "50%", // 円形にする
                        top: "1%",
                        left: "6%",
                      }}
                    >
                      <InfoIcon
                        sx={{
                          color: "#E0E0E0",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {safeData.map((row: any, rowIndex: number) => (
            <TableRow key={rowIndex}>
              {safecolumnHeader.map((column, index) => {
                const currentData = row[column];
                const previousDate = getPreviousDateString(column);
                const previousData = safeData[rowIndex][previousDate];
                const isIncrease =
                  typeof currentData === "number" &&
                  typeof previousData === "number" &&
                  currentData > previousData;

                return (
                  <TableCell
                    key={column}
                    sx={{
                      color:
                        index > 1 && isIncrease && previousData !== -1
                          ? "#ff6666"
                          : currentData === -1
                          ? "#AFAFAF"
                          : "#000000",
                      fontWeight:
                        index > 1 && isIncrease
                          ? "bold"
                          : currentData === -1
                          ? "bold"
                          : null,
                    }}
                  >
                    {index > 1 && isIncrease ? (
                      <Tooltip title="在庫が増加しています。" arrow>
                        <span>{currentData}</span>
                      </Tooltip>
                    ) : currentData === -1 ? (
                      "-"
                    ) : (
                      currentData
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </MUITable>
    </TableContainer>
  );
};

export default Table;
