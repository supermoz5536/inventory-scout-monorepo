import React, { useCallback, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Top from "./pages/Top";
import Manage from "./pages/Manage";
import { AppDispatch, RootState } from "./redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAsinData,
  updateWithLoadedData,
} from "./redux/asinDataListSlice";

const App: React.FC = () => {
  // ストアから asinDataList の現在の値を取得し、
  // コンポーネントのレンダリングサイクル内で使用できるようにします。
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );
  // asinDataList の初期値を保持する ref オブジェクトを作成し、
  // コンポーネントの再レンダリングに影響されず
  // asinDataListの変更のみに依存して
  // 最新のデータを参照できるようにします。
  const asinDataListRef = useRef(asinDataList);
  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  const dispatch = useDispatch<AppDispatch>();

  /// useCallbackを使用して関数の参照を安定させる
  const handleScrapingResult = useCallback(
    (event: Electron.IpcRendererEvent, data: AsinData) => {
      (async () => {
        console.log("取得データ =", data);
        // グローバル変数のASINリストの
        // 取得したasinDataと合致するオブジェクトを
        // 取得したデータに更新
        dispatch(updateAsinData(data));
        // 更新したasinDataListの最新データに
        // ローカルデータを更新
        // 最新の参照を利用してるので
        // 依存関係に指定する必要はない
        await window.myAPI.saveData(asinDataListRef.current);
      })();
    },
    [dispatch]
  );

  /// アプリ立ち上げの初期化処理
  /// ① メインプロセスでのスクレイピング結果の取得リスナーの配置と削除
  /// ② ローカルストレージデータのロード
  useEffect(() => {
    (async () => {
      // ①
      console.log("scrapingResult called");
      window.myAPI.scrapingResult(handleScrapingResult);

      // ②
      const loadedData = await window.myAPI.loadData();
      dispatch(updateWithLoadedData(loadedData));

      return () => {
        // ①
        console.log("scrapingResult disposed ");
        window.myAPI.removeScrapingResult(handleScrapingResult);
      };
    })();
  }, [handleScrapingResult]);

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
