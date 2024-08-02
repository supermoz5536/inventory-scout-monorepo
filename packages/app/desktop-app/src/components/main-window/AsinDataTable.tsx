import React, { useEffect, useRef } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";

import Checkbox from "@mui/material/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import { switchRemoveCheck } from "../../slices/asinDataListSlice";
import { Box } from "@mui/material";
import {
  calculateDataForChart,
  calculateDecreaseLatestToPrevEl,
  prepareDataForCalculateDecrease,
} from "../../util/calculateDecrease";

export const AsinDataTable = () => {
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );
  const asinDataListRef = useRef(asinDataList);
  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  const dispatch = useDispatch<AppDispatch>();
  const gotoAmazonURL = (asin: string) => {
    const amazonURL = `https://www.amazon.co.jp/dp/${asin}`;
    window.myAPI.openExternal(amazonURL);
  };
  const handleDeleteCheck = (id: string) => {
    dispatch(switchRemoveCheck(id));
  };
  const handleDecrease2 = (asinData: AsinData) => {
    const data = prepareDataForCalculateDecrease(asinData);
    const result = calculateDataForChart(data, true).newTotalDecrease;
    return result;
  };

  const columns: readonly GridColDef<AsinData>[] = [
    // {
    //   field: "isDeleteCheck",
    //   headerName: "削除",
    //   width: 65,
    //   renderCell: (params: any) => (
    //     <Checkbox
    //       checked={params.row.isDeleteCheck}
    //       onChange={() => handleDeleteCheck(params.row.id)}
    //     />
    //   ),
    // },
    { field: "asin", headerName: "ASIN", width: 130 },
    {
      field: "",
      headerName: "",
      width: 130,
      renderCell: (params) => (
        <>
          <button className="top-square-space-each-button">出品者一覧</button>
          <button
            className="top-square-space-each-button"
            onClick={() => {
              gotoAmazonURL(params.row.asin);
            }}
          ></button>
        </>
      ),
    },
    {
      field: "imageURL",
      headerName: "画像",
      width: 150,
      renderCell: (params) => (
        <img
          src={params.value}
          alt={params.row.name}
          style={{ width: "100%" }}
        />
      ),
    },
    { field: "name", headerName: "商品名", width: 250 },
    { field: "amazonSellerNOP", headerName: "AMAZON数", width: 90 },
    { field: "fbaSellerNOP", headerName: "FBA数", width: 65 },
    { field: "totalStock", headerName: "FBA合計在庫", width: 65 },
    { field: "cartPrice", headerName: "カート価格", width: 90 },
    {
      field: "decrease1",
      headerName: "減少１",
      width: 65,
      // valueGetter: (params: any) => calculateDecreaseLatestToPrevEl(params.row),
    },
    {
      field: "decrease2",
      headerName: "減少２",
      width: 65,
      // valueGetter: (params: any) => handleDecrease2(params.row),
    },
    {
      field: "fetchLatestDateTime",
      headerName: "最新取得",
      width: 100,
      // valueGetter: (params: any) =>
      //   `${params.row.fetchLatestDate} ${params.row.fetchLatestTime}`,
    },
    {
      field: "isScraping",
      headerName: "取得状況",
      width: 100,
      // valueGetter: (params: any) =>
      //   params.row.isScraping === null
      //     ? ""
      //     : params.row.isScraping
      //     ? "取得中"
      //     : "取得完了",
    },
    { field: "asinParent", headerName: "親ASIN", width: 130 },
  ];

  return (
    <Box sx={{ height: 750, width: 1485, backgroundColor: "white" }}>
      <DataGrid
        rows={asinDataListRef.current}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: asinDataListRef.current.length,
            },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        hideFooterPagination // ページネーションエリアを非表示に設定
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText} // ここで日本語を設定
        sx={{
          border: "0.5px solid #c0c0c0",
          boxShadow: 3, // 影のレベルを指定
          "& .MuiDataGrid-footerContainer": {
            display: "none",
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "white", // アイテムの背景色を変更
          },
        }}
      />
    </Box>
  );
};
