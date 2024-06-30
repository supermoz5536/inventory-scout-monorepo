import React, { useCallback, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Top from "./pages/Top";
import Manage from "./pages/Manage";
import { AppDispatch, RootState } from "./redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateAsinData } from "./redux/asinDataListSlice";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  /// useCallbackを使用して関数の参照を安定させる
  const handleScrapingResult = useCallback(
    (event: Electron.IpcRendererEvent, data: AsinData) => {
      console.log("取得データ =", data);
      dispatch(updateAsinData(data));
    },
    []
  );

  /// アプリ立ち上げの初期化処理として
  ///  メインプロセスでのスクレイピング結果の取得する
  ///  リスナーを配置します。
  useEffect(() => {
    console.log("scrapingResult called");
    window.myAPI.scrapingResult(handleScrapingResult);

    return () => {
      console.log("scrapingResult disposed ");
      window.myAPI.removeScrapingResult(handleScrapingResult);
    };
  }, [handleScrapingResult]);

  // グローバル変数のASINリストの値を取得
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );

  /// アプリ終了によるスクレイピングの中断があった場合に
  /// 中断したところから取得処理を再開する
  /// 自動フォローアップ処理
  /// マウント時に一回だけ起動
  useEffect(() => {
    if (asinDataList.length > 0) {
      const today = new Date();
      const todayFormatted = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const checkArray = asinDataList.find((asinData) => {
        // 以下２点を満たすとTrue
        // スクレイピングが取得中で
        // 今日の日付のStockCountDataが存在してる場合
        return (
          asinData.isScraping === true &&
          Object.keys(asinData.fbaSellerDatas).includes(todayFormatted)
        );
      });

      if (checkArray) {
        window.myAPI.runScraping(asinDataList);
      }
    }
  }, []);

  return (
    <div>
      <Routes>
        {/* ユーザーがアプリケーションのルートURL (/) にアクセスしたときに、
        /Topにリダイレクトするための設定です。 */}
        <Route path="/" element={<Navigate to="/Top" />} />
        {/* 各ページのURLパスと対応するコンポーネントをルートをマッピングしてます。 */}
        <Route path="/Top" element={<Top />} />
        <Route path="/Manage" element={<Manage />} />
      </Routes>
    </div>
  );
};

export default App;
