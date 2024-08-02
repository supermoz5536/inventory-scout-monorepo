import { Box, Typography } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import { useSelector } from "react-redux";

export const Footer = ({ scrapeTimeLeft }: { scrapeTimeLeft: number }) => {
  // システム関係の状態変数の取得
  const systemStatus: number = useSelector(
    (state: RootState) => state.systemStatus.value.systemStatus
  );

  return (
    <Box
      component={"div"}
      className="top-bottom-container"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "start",
        alignItems: "center",
        backgroundColor: "#f7f7f7",
        minHeight: "45px",
        height: "45px",
        boxShadow: 3,
        marginTop: "20px",
      }}
    >
      {systemStatus === 0 ? (
        ""
      ) : systemStatus === 1 ? (
        <>
          <RunningWithErrorsIcon sx={{ color: "#f44336", marginRight: 1 }} />
          <Typography
            variant="h5"
            sx={{ color: "#828282", fontWeight: "bold", fontSize: "15px" }}
          >
            `データ取得中...残り${scrapeTimeLeft}分`
          </Typography>
        </>
      ) : systemStatus === 2 ? (
        <>
          <RunningWithErrorsIcon sx={{ color: "#f44336", marginRight: 1 }} />
          <Typography
            variant="h5"
            sx={{ color: "#828282", fontWeight: "bold", fontSize: "15px" }}
          >
            `前回のデータ取得処理が途中で中断されました。続きのデータを取得中...残り$
            {scrapeTimeLeft}分`
          </Typography>
        </>
      ) : systemStatus === 3 ? (
        <>
          <RunningWithErrorsIcon sx={{ color: "#f44336", marginRight: 1 }} />
          <Typography
            variant="h5"
            sx={{ color: "#828282", fontWeight: "bold", fontSize: "15px" }}
          >
            `追加されたASINのデータを取得中...残り${scrapeTimeLeft}分`
          </Typography>
        </>
      ) : systemStatus === 4 ? (
        <>
          <DoneIcon sx={{ color: "#4caf50", marginRight: 1 }} />
          <Typography
            variant="h5"
            sx={{ color: "#828282", fontWeight: "bold", fontSize: "15px" }}
          >
            `本日分のデータ取得は既に完了しています。`
          </Typography>
        </>
      ) : systemStatus === 5 ? (
        <>
          <DoneIcon sx={{ color: "#4caf50", marginRight: 1 }} />
          <Typography
            variant="h5"
            sx={{ color: "#828282", fontWeight: "bold", fontSize: "15px" }}
          >
            `データ取得が完了しました。`
          </Typography>
        </>
      ) : (
        `System cord e`
      )}
    </Box>
  );
};
