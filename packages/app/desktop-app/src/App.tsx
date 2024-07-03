import React, { useCallback, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Top from "./pages/Top";
import Manage from "./pages/Manage";
import { AppDispatch, RootState, store } from "./redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAsinData,
  updateWithLoadedData,
} from "./redux/asinDataListSlice";
import { switchSystemStatus } from "./redux/systemStatusSlice";

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
    (
      event: Electron.IpcRendererEvent,
      asinData: AsinData | null,
      isEnd: boolean | null
    ) => {
      (async () => {
        if (isEnd) {
          // システムメッセージの表示フラグ
          //「データ取得完了」
          dispatch(switchSystemStatus(3));
        } else if (asinData) {
          // グローバル変数のASINリストの
          // 取得したasinDataと合致するオブジェクトを
          // 取得したデータに更新
          dispatch(updateAsinData(asinData));
          // 状態変数の更新が完了するまで200ms待機
          await new Promise((resolve) => setTimeout(resolve, 200));
          // ローカルストレージへasinDataListを保存
          // 最新の参照を利用してるので
          // 依存関係の指定は必要ない
          await window.myAPI.saveData(asinDataListRef.current);
        }
      })();
    },
    [dispatch]
  );

  /// アプリ立ち上げの初期化処理
  /// ① メインプロセスでのスクレイピング結果の取得リスナーの配置と削除
  /// ② ローカルストレージデータのロード
  /// ③ 中断されていた場合の自動フォローアップ
  useEffect(() => {
    (async () => {
      try {
        // ①
        console.log("scrapingResult called");
        window.myAPI.scrapingResult(handleScrapingResult);

        // ②
        const loadedData = await window.myAPI.loadData();
        dispatch(updateWithLoadedData(loadedData));

        // ③
        if (asinDataListRef.current.length > 0) {
          const today = new Date();
          const todayFormatted = `${today.getFullYear()}-${String(
            today.getMonth() + 1
          ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

          const checkArray = asinDataListRef.current.find((asinData) => {
            // 以下２点を満たすとTrue
            // ・スクレイピングが取得中
            // ・今日の日付のStockCountDataが存在してる
            return (
              asinData.isScraping === true &&
              asinData.fbaSellerDatas.some((fbaSellerData) =>
                fbaSellerData.stockCountDatas.some((stockCountData) =>
                  Object.keys(stockCountData).includes(todayFormatted)
                )
              )
            );
          });

          if (checkArray) {
            console.log("アプリ中断後のフォローアップ処理実行");
            // システムメッセージ表示フラグ
            //「アプリ終了で中断された取得処理を自動で...」
            dispatch(switchSystemStatus(3));
            window.myAPI.runScraping(asinDataListRef.current);
          }
        }

        return () => {
          // ①
          console.log("scrapingResult disposed ");
          window.myAPI.removeScrapingResult(handleScrapingResult);
        };
      } catch (error) {
        console.log("アプリ立ち上げの初期化処理エラー:", error);
      }
    })();
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
