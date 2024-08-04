import React, { useEffect, useRef, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import { switchRemoveCheck } from "../../slices/asinDataListSlice";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  calculateDataForChart,
  calculateDecreaseLatestToPrevEl,
  prepareDataForCalculateDecrease,
} from "../../util/calculateDecrease";
import InfoIcon from "@mui/icons-material/Info";
import { getPrevScrapingDate } from "../../util/asinDataUtil";

export const AsinDataTable = () => {
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );

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
    {
      field: "asin",
      headerName: "ASIN",
      width: 130,
      disableColumnMenu: false,
      sortable: false,
      renderHeader: (params) => params.colDef.headerName,
    },
    {
      field: " ",
      headerName: "",
      width: 100,
      disableColumnMenu: false,
      sortable: false,
      renderHeader: (params) => (
        <div style={{ backgroundColor: "white", height: "100%" }}>
          {params.colDef.headerName}
        </div>
      ),
      renderCell: (params) => (
        <Box component={"div"} className="top-square-space-3buttonp-elements ">
          {/* Scraperコンポーネントの実行ボタン */}
          <Button
            className="top-square-space-each-button-1"
            onClick={() => {
              gotoAmazonURL(params.row.asin);
            }}
            variant="outlined"
            sx={{
              backgroundColor: "white",
              fontWeight: "bold",
              fontSize: "11px",
              "&:hover": {
                backgroundColor: "#dedede", // ホバー時の背景色
              },
            }}
          >
            商品URL
          </Button>
          <Button
            className="top-square-space-each-button-2"
            onClick={() => {
              window.myAPI.openStockDetail(params.row);
            }}
            variant="outlined"
            sx={{
              backgroundColor: "#white",
              fontWeight: "bold",
              fontSize: "11px",
              "&:hover": {
                backgroundColor: "#dedede", // ホバー時の背景色
              },
            }}
          >
            <Typography
              sx={{
                marginTop: "3.5px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              在庫データ
            </Typography>
          </Button>
        </Box>
      ),
    },
    {
      field: "imageURL",
      headerName: "画像",
      width: 65,
      disableColumnMenu: false,
      sortable: false,
      renderHeader: (params) => params.colDef.headerName,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <img
            src={params.value}
            alt={params.row.name}
            style={{ width: "100%" }}
          />
        </div>
      ),
    },
    {
      field: "name",
      headerName: "商品名",
      width: 200,
      disableColumnMenu: false,
      sortable: false,
      renderHeader: (params) => params.colDef.headerName,
    },
    {
      field: "amazonSellerNOP",
      headerName: "AMAZON数",
      width: 100,
      disableColumnMenu: false,
      sortable: true,
      renderHeader: (params) => params.colDef.headerName,
    },
    {
      field: "fbaSellerNOP",
      headerName: "FBA数",
      width: 65,
      disableColumnMenu: false,
      sortable: true,
      renderHeader: (params) => params.colDef.headerName,
    },
    {
      field: "totalStock",
      headerName: "FBA合計在庫",
      width: 100,
      disableColumnMenu: false,
      sortable: true,
      renderHeader: (params) => params.colDef.headerName,
    },
    {
      field: "cartPrice",
      headerName: "カート価格",
      width: 100,
      disableColumnMenu: false,
      sortable: true,
      renderHeader: (params) => params.colDef.headerName,
    },
    {
      field: "decrease1",
      headerName: "減少１",
      width: 105,
      disableColumnMenu: false,
      sortable: true,
      renderHeader: (params) => (
        <div>
          <Tooltip
            title={
              "「最新取得」と「前回取得」（最新の1つ前の取得）を比較したときの在庫の減少数です。"
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
            <IconButton>
              <InfoIcon
                sx={{
                  color: "#E0E0E0",
                }}
              />
            </IconButton>
          </Tooltip>
          {params.colDef.headerName}
        </div>
      ),
      renderCell: (params) => calculateDecreaseLatestToPrevEl(params.row),
      valueGetter: (prams, row) => calculateDecreaseLatestToPrevEl(row),
    },
    {
      field: "decrease2",
      headerName: "減少２",
      width: 105,
      disableColumnMenu: false,
      sortable: true,
      renderHeader: (params) => (
        <div>
          <Tooltip
            title={"直近7日間の在庫の減少数です（Nはエラー）"}
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
            <IconButton>
              <InfoIcon
                sx={{
                  color: "#E0E0E0",
                }}
              />
            </IconButton>
          </Tooltip>
          {params.colDef.headerName}
        </div>
      ),
      renderCell: (params) =>
        Number.isNaN(handleDecrease2(params.row))
          ? "N"
          : handleDecrease2(params.row),
      valueGetter: (prams, row) => handleDecrease2(row),
    },
    {
      field: "",
      headerName: "前回取得",
      width: 100,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => getPrevScrapingDate(params.row),
    },
    {
      field: "fetchLatestDateTime",
      headerName: "最新取得",
      width: 100,
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            height: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: "0" /* 要素が親スペースより大きいとき縮小を防止*/,
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
            }}
          >
            {params.row.fetchLatestDate}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
            }}
          >
            {params.row.fetchLatestTime}
          </Typography>
        </Box>
      ),
    },
    {
      field: "isScraping",
      headerName: "取得状況",
      width: 100,
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) =>
        params.row.isScraping === null
          ? ""
          : params.row.isScraping
          ? "取得中"
          : "取得完了",
    },
    {
      field: "asinParent",
      headerName: "親ASIN",
      width: 130,
      disableColumnMenu: false,
      sortable: false,
    },
  ];

  return (
    <Box sx={{ height: 750, width: 1570, backgroundColor: "white" }}>
      <DataGrid
        rows={asinDataList}
        columns={columns}
        rowHeight={80} // 行の高さを70に設定
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        // hideFooterPagination // ページネーションエリアを非表示に設定
        // pageSizeOptions={[2]}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText} // ここで日本語を設定
        sx={{
          border: "0.5px solid #c0c0c0",
          boxShadow: 3, // 影のレベルを指定
          // "& .MuiDataGrid-footerContainer": {
          //   display: "none",
          // },
          "& .MuiDataGrid-row": {
            backgroundColor: "white", // アイテムの背景色を変更
          },
        }}
      />
    </Box>
  );
};
