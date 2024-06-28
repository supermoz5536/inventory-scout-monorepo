import React, { useCallback, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Top from "./pages/Top";
import Manage from "./pages/Manage";
import { AppDispatch } from "./redux/store";
import { useDispatch } from "react-redux";
import { updateAsinData } from "./redux/asinDataListSlice";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // useCallbackを使用して関数の参照を安定させる
  const handleScrapingResult = useCallback(
    (event: Electron.IpcRendererEvent, data: AsinData) => {
      console.log("取得データ =", data);
      dispatch(updateAsinData(data));
    },
    []
  );

  // アプリ立ち上げの初期化処理として
  // メインプロセスでのスクレイピング結果の取得する
  // リスナーを配置します。
  useEffect(() => {
    console.log("scrapingResult called");
    window.myAPI.scrapingResult(handleScrapingResult);

    return () => {
      console.log("scrapingResult disposed ");
      window.myAPI.removeScrapingResult(handleScrapingResult);
    };
  }, [handleScrapingResult]);

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
