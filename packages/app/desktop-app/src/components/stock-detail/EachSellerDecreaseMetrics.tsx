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
  Tooltip,
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
  const keys: string[] = Array.from(
    new Set(
      data.flatMap((item: any) =>
        Object.keys(item).filter(
          (key) => key !== "FBA全体在庫" && key !== "date"
        )
      )
    )
  );
  const keysFixed: string[] = ["　", ...keys];

  let decreaseCount: number = 0;
  let increaseCount: number = 0;

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

  // ========================================================================

  useEffect(() => {
    // メニューで各セラーが未選択の場合
    if (selectedIndex === 0) {
      setTotalDecrease(0);
      setDayAverage(0);

      // 選択されてる場合
    } else {
      const result = data.reduce(
        (acc: number, currentData: any, index: number, array: any) => {
          if (index === 0) return acc; // 最初の要素には前日がないためスキップ

          // 現在処理してる日付のオブジェクトとその前の日のオブジェクトの差分をとる
          const prevData = array[index - 1];

          const currentSelectedSellerStock =
            currentData[keysFixed[selectedIndex]] ?? null;

          const prevSelectedSellerStock =
            prevData[keysFixed[selectedIndex]] ?? null;

          const isIncrease: boolean =
            currentSelectedSellerStock - prevSelectedSellerStock > 0;

          // 増加（補充）日のフィルター処理
          if (isIncrease && prevData["FBA全体在庫"] !== null) {
            ++increaseCount;
            return acc;
          }
          // ■ 合算処理
          // 増加（補充）してるセラーがいない
          // かつ
          // "FBA全体在庫" の値が前日と当日にある
          // その場合は合算処理
          if (
            prevSelectedSellerStock &&
            currentSelectedSellerStock &&
            !isIncrease
          ) {
            const difference =
              prevSelectedSellerStock - currentSelectedSellerStock;

            // if (difference >= 0) {
            // 減少 or 同じ値の場合
            ++decreaseCount;
            return (acc = acc + difference);
          } else {
            // "FBA全体在庫" の値が
            // 前日と当日のどちらかで欠けてる場合はスキップ
            return acc;
          }
        },
        0
      );

      // 日次の平均減少数を算出する、その際に
      // 指定期間の最初の日付はスキップしてるので -1 する。
      // 算出した値を増加日をスキップした回数分だけ加える。
      // これで増加日の減少数を
      // 日次の平均減少数シミュレートしたことになる。
      const newDayAverage = result / decreaseCount;
      const newTotalDecrease = result + newDayAverage * increaseCount;

      // Math.round : 小数点以下を四捨五入
      setDayAverage(Math.round(newDayAverage));
      setTotalDecrease(Math.round(newTotalDecrease));
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
          maxWidth: "350px",
          marginTop: 3.25,
          marginBottom: 0,
          marginLeft: 7.5,
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
                // <Tooltip
                //   title={
                //     index === 0
                //       ? "選択したセラーの指定期間内の在庫減少数です。在庫の増加している日付では、近似値として１日あたりの平均減少数(右隣の日次)の値に差し替えて計算しています。"
                //       : index === 1
                //       ? "指定期間内の１日あたりの減少数の平均値です。"
                //       : index === 2
                //       ? "指定期間内の1週間あたりの減少数の平均値です。"
                //       : "指定期間内の1ヶ月あたりの減少数の平均値です。"
                //   }
                //   placement="top"
                //   arrow
                //   PopperProps={{
                //     modifiers: [
                //       {
                //         name: "offset",
                //         options: {
                //           offset: [0, -5], // ここでピクセル単位で位置を調整
                //         },
                //       },
                //     ],
                //   }}
                // >
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
                          color: colors[selectedIndex],
                        }}
                      >
                        {keysFixed.map((key: any, sellerIndex) => {
                          return (
                            <MenuItem
                              value={sellerIndex}
                              sx={{
                                color: colors[sellerIndex],
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
                // {/* </Tooltip> */}
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
