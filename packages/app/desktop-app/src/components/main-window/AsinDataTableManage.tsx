import React, { useEffect, useRef, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridInputRowSelectionModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsDeleteCheckSelected,
  switchIsDeleteCheckAll,
  switchRemoveCheck,
} from "../../slices/asinDataListSlice";
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

export const AsinDataTableManage = () => {
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );

  const dispatch = useDispatch<AppDispatch>();
  const initialSelectedIds = asinDataList
    .filter((asinData: AsinData) => asinData.isDeleteCheck === true)
    .map((asinData: AsinData) => asinData.asin);

  const [selectedIds, setSelectedIds] = useState<
    GridInputRowSelectionModel | undefined
  >(initialSelectedIds);

  useEffect(() => {
    const newSelectedIds = asinDataList
      .filter((asinData: AsinData) => asinData.isDeleteCheck === true)
      .map((asinData: AsinData) => asinData.asin);

    setSelectedIds(newSelectedIds);
  }, [asinDataList]);

  // const gotoAmazonURL = (asin: string) => {
  //   const amazonURL = `https://www.amazon.co.jp/dp/${asin}`;
  //   window.myAPI.openExternal(amazonURL);
  // };

  // const handleDeleteCheck = (id: string) => {
  //   dispatch(switchRemoveCheck(id));
  // };

  // const handleDecrease2 = (asinData: AsinData) => {
  //   const data = prepareDataForCalculateDecrease(asinData);
  //   const result = calculateDataForChart(data, true).newTotalDecrease;

  //   return result;
  // };

  const columns: readonly GridColDef<AsinData>[] = [
    {
      field: "asin",
      headerName: "ASIN",
      width: 130,
      disableColumnMenu: false,
      sortable: false,
      renderHeader: (params) => params.colDef.headerName,
    },
    // {
    //   field: " ",
    //   headerName: "",
    //   width: 100,
    //   disableColumnMenu: false,
    //   sortable: false,
    //   renderHeader: (params) => (
    //     <div style={{ backgroundColor: "white", height: "100%" }}>
    //       {params.colDef.headerName}
    //     </div>
    //   ),
    //   renderCell: (params) => (
    //     <Box component={"div"} className="top-square-space-3buttonp-elements ">
    //       {/* Scraperコンポーネントの実行ボタン */}
    //       <Button
    //         className="top-square-space-each-button-1"
    //         onClick={() => {
    //           gotoAmazonURL(params.row.asin);
    //         }}
    //         variant="outlined"
    //         sx={{
    //           backgroundColor: "white",
    //           fontWeight: "bold",
    //           fontSize: "11px",
    //           "&:hover": {
    //             backgroundColor: "#dedede", // ホバー時の背景色
    //           },
    //         }}
    //       >
    //         商品URL
    //       </Button>
    //       <Button
    //         className="top-square-space-each-button-2"
    //         onClick={() => {
    //           window.myAPI.openStockDetail(params.row);
    //         }}
    //         variant="outlined"
    //         sx={{
    //           backgroundColor: "#white",
    //           fontWeight: "bold",
    //           fontSize: "11px",
    //           "&:hover": {
    //             backgroundColor: "#dedede", // ホバー時の背景色
    //           },
    //         }}
    //       >
    //         <Typography
    //           sx={{
    //             marginTop: "3.5px",
    //             fontSize: "11px",
    //             fontWeight: "bold",
    //           }}
    //         >
    //           在庫データ
    //         </Typography>
    //       </Button>
    //     </Box>
    //   ),
    // },
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
      width: 550,
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
    // {
    //   field: "totalStock",
    //   headerName: "FBA合計在庫",
    //   width: 100,
    //   disableColumnMenu: false,
    //   sortable: true,
    //   renderHeader: (params) => params.colDef.headerName,
    // },
    // {
    //   field: "cartPrice",
    //   headerName: "カート価格",
    //   width: 100,
    //   disableColumnMenu: false,
    //   sortable: true,
    //   renderHeader: (params) => params.colDef.headerName,
    //   renderCell: (params) => params.row.cartPrice,
    //   valueGetter: (prams, row) => Number(row.cartPrice.replace(/,/g, "")),
    // },
    // {
    //   field: "decrease1",
    //   headerName: "前回減少",
    //   width: 105,
    //   disableColumnMenu: false,
    //   sortable: true,
    //   renderHeader: (params) => (
    //     <Box
    //       sx={{
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       <Tooltip
    //         title={
    //           "「最新取得」と「前回取得」（最新の1つ前の取得）を比較したときの在庫の減少数です（Nはエラー）"
    //         }
    //         placement="top"
    //         arrow
    //         PopperProps={{
    //           modifiers: [
    //             {
    //               name: "offset",
    //               options: {
    //                 offset: [0, -5], // ここでピクセル単位で位置を調整
    //               },
    //             },
    //           ],
    //         }}
    //       >
    //         <InfoIcon
    //           sx={{
    //             marginRight: "3px",
    //             color: "#E0E0E0",
    //           }}
    //         />
    //       </Tooltip>

    //       {params.colDef.headerName}
    //     </Box>
    //   ),
    //   renderCell: (params) => (
    //     <Box
    //       sx={{
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       {calculateDecreaseLatestToPrevEl(params.row) === -99999
    //         ? "N"
    //         : calculateDecreaseLatestToPrevEl(params.row)}
    //     </Box>
    //   ),
    //   valueGetter: (prams, row) => calculateDecreaseLatestToPrevEl(row),
    // },
    // {
    //   field: "decrease2",
    //   headerName: "週間減少",
    //   width: 105,
    //   disableColumnMenu: false,
    //   sortable: true,
    //   renderHeader: (params) => (
    //     <Box
    //       sx={{
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       <Tooltip
    //         title={"直近7日間の在庫の減少数です（Nはエラー）"}
    //         placement="top"
    //         arrow
    //         PopperProps={{
    //           modifiers: [
    //             {
    //               name: "offset",
    //               options: {
    //                 offset: [0, -5], // ここでピクセル単位で位置を調整
    //               },
    //             },
    //           ],
    //         }}
    //       >
    //         <InfoIcon
    //           sx={{
    //             marginRight: "3px",
    //             color: "#E0E0E0",
    //           }}
    //         />
    //       </Tooltip>
    //       {params.colDef.headerName}
    //     </Box>
    //   ),
    //   renderCell: (params) => (
    //     <Box
    //       sx={{
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       {Number.isNaN(handleDecrease2(params.row))
    //         ? "N"
    //         : handleDecrease2(params.row)}
    //     </Box>
    //   ),
    //   valueGetter: (prams, row) =>
    //     Number.isNaN(handleDecrease2(row)) ? -99999 : handleDecrease2(row),
    // },
    // {
    //   field: "",
    //   headerName: "前回取得",
    //   width: 100,
    //   disableColumnMenu: false,
    //   sortable: false,
    //   renderHeader: (params) => (
    //     <Box
    //       sx={{
    //         paddingLeft: "10px",
    //       }}
    //     >
    //       {params.colDef.headerName}
    //     </Box>
    //   ),
    //   renderCell: (params) => (
    //     <Box
    //       sx={{
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       {getPrevScrapingDate(params.row)}
    //     </Box>
    //   ),
    // },
    {
      field: "fetchLatestDateTime",
      headerName: "最新取得",
      width: 100,
      disableColumnMenu: false,
      sortable: false,
      renderHeader: (params) => (
        <Box
          sx={{
            paddingLeft: "9.5px",
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
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
      renderHeader: (params) => (
        <Box
          sx={{
            paddingLeft: "22.5px",
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
      disableColumnMenu: false,
      sortable: false,
    },
  ];

  const handleSelectionChange = (newSelection: any) => {
    if (newSelection.length === asinDataList.length) {
      console.log("すべての行が選択されました");
      dispatch(switchIsDeleteCheckAll(true));
    } else if (newSelection.length === 0) {
      console.log("すべての行の選択が解除されました");
      dispatch(switchIsDeleteCheckAll(false));
    } else {
      console.log("一部の行が選択されました");
      dispatch(setIsDeleteCheckSelected(newSelection));
    }
  };

  return (
    <Box sx={{ height: 792.5, width: 1350, backgroundColor: "white" }}>
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
        onRowSelectionModelChange={handleSelectionChange} // 選択変更時のコールバック
        getRowId={(row) => row.asin} // 行のIDとしてasinを使用する
        rowSelectionModel={selectedIds}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText} // ここで日本語を設定
        // hideFooterPagination // ページネーションエリアを非表示に設定
        // pageSizeOptions={[2]}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "white !important", // ヘッダーの背景色を白に設定
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "white !important", // ヘッダーセルの背景色を白に設定
          },
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
