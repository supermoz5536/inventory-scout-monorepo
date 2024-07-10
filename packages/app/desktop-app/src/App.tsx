import React, { useCallback, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  updateAsinData,
  updateWithLoadedData,
} from "./slices/asinDataListSlice";
import { changeSystemStatus } from "./slices/systemStatusSlice";
import Top from "./pages/Top";
import Manage from "./pages/Manage";
import Setting from "./pages/Setting";
import LoginPrompt from "./pages/LoginPrompt";
import { logOut } from "./firebase/authentication";
import { changeAuthedStatus } from "./slices/userSlice";

const App: React.FC = () => {
  // asinDataList の初期値を保持する ref オブジェクトを作成し、
  // コンポーネントの再レンダリングに影響されず
  // asinDataListの変更のみに依存して
  // 最新のデータを参照できるようにします。
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );
  const asinDataListRef = useRef(asinDataList);
  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  const dispatch = useDispatch<AppDispatch>();

  /// アプリ立ち上げの初期化処理
  /// ① メインプロセスでのスクレイピング結果の取得リスナーの配置と削除
  /// ② ローカルストレージデータのロード
  /// ③ ログアウト処理
  /// ④ 「次回からは自動でログインする」が有効な場合の自動ログイン処理
  /// ⑤ 中断されていた場合の自動フォローアップ (自動ログイン時がTrue === ログイン状態の場合のみ)
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
        const signOutResult: boolean = await logOut();
        if (signOutResult === true) {
          dispatch(changeAuthedStatus(false));
        }

        // ⑤
        // ■ 同日に前回の処理が中断されている場合の自動処理
        if (asinDataListRef.current.length > 0) {
          const today = new Date();
          const todayFormatted = `${today.getFullYear()}-${String(
            today.getMonth() + 1
          ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

          const checkArray = asinDataListRef.current.find(
            (asinData: AsinData) => {
              // 以下２点を満たすとTrue
              // ・スクレイピングが取得中
              // ・今日の日付のStockCountDataが存在してる
              return (
                asinData.isScraping === true &&
                (asinData.fbaSellerDatas.some((fbaSellerData) =>
                  fbaSellerData.stockCountDatas.some((stockCountData) =>
                    Object.keys(stockCountData).includes(todayFormatted)
                  )
                ) ||
                  asinData.fetchLatestDate === "")
              );
            }
          );

          if (checkArray) {
            console.log("同日に前回処理が中断された際の自動フォローアップ起動");
            // システムメッセージ表示フラグ
            //「アプリ終了で中断された取得処理を自動で...」
            dispatch(changeSystemStatus(2));
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
  }, []);
  // }, [handleScrapingResult]);
  // 不具合が生じた際は、,[]の追跡を
  // コメントアウトしてるhandleScrapingResultに戻して
  // handleScrapingResultの宣言の後にuseEffectを再配置する

  /// メインプロセスからスクレイピングデータを
  /// 取得した際のコールバック関数
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
          dispatch(changeSystemStatus(5));
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

  return (
    <div>
      <Routes>
        {/* ユーザーがアプリケーションのルートURL (/) にアクセスしたときに、
        /Topにリダイレクトするための設定です。 */}
        <Route path="/" element={<Navigate to="/Top" />} />
        {/* 各ページのURLパスと対応するコンポーネントをルートをマッピングしてます。 */}
        <Route path="/Top" element={<Top />} />
        <Route path="/Manage" element={<Manage />} />
        <Route path="/Setting" element={<Setting />} />
        <Route path="/LoginPrompt" element={<LoginPrompt />} />
      </Routes>
    </div>
  );
};

export default App;
