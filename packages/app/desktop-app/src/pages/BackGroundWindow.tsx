import React, { useCallback, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  updateAsinData,
  updateIsScrapingTrueAll,
  updateWithLoadedData,
} from "../slices/asinDataListSlice";
import {
  changeShowButtonStatus,
  changeSystemStatus,
} from "../slices/systemStatusSlice";
import Top from "../pages/Top";
import Manage from "../pages/Manage";
import Setting from "../pages/Setting";
import LoginPrompt from "../pages/LoginPrompt";
import StockDetail from "../pages/StockDetail";
import {
  logInWithEmailAndPassword,
  listenAuthState,
  initLogoutCallBack,
} from "../firebase/authentication";
import { updateUser } from "../slices/userSlice";
import { DocumentData } from "firebase/firestore";
import { getUserDoc, setPlanFieldListener } from "../firebase/firestore";
import MainWindow from "../pages/MainWindow";

const BackGroundWindow = () => {
  // asinDataList の初期値を保持する ref オブジェクトを作成し、
  // コンポーネントの再レンダリングに影響されず
  // asinDataListの変更のみに依存して
  // 最新のデータを参照できるようにします。
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value,
  );
  const asinDataListRef = useRef(asinDataList);
  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  const systemStatus: any = useSelector(
    (state: RootState) => state.systemStatus.value,
  );
  const systemStatusRef = useRef(systemStatus);
  useEffect(() => {
    systemStatusRef.current = systemStatus;
  }, [systemStatus]);

  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const dispatch = useDispatch<AppDispatch>();
  let isInitialized: boolean = false;

  /// アプリ立ち上げの初期化処理
  /// ⓪ systemStatusを初期化
  /// ① メインプロセスでのスクレイピング結果の取得リスナーの配置と削除
  /// ② 移行データの取得リスナーの配置と削除
  /// ③ ローカルストレージデータのロード(persistorで代わりに運用中)
  /// ④ サーバーサイドの認証ステータスと常に同期するリスナーを設置
  /// ⑤ メインプロセス起動時にログアウト処理のトリガーを受信するリスナーの配置と削除
  /// ⑥ 「次回からは自動でログインする」が有効な場合の自動ログイン処理
  /// ⑦ 保存されてる定時スクレイピングの指定時刻の再設定
  /// ⑧ メインプロセスの定時スクレイピング実行をリスンして状態変数を更新
  /// ⑨ 中断されていた場合の自動フォローアップ (自動ログイン時がTrue === ログイン状態の場合のみ)
  useEffect(() => {
    if (isInitialized === false) {
      isInitialized = true;
      (async () => {
        try {
          console.log("Initializing process excuted");

          // ⓪
          window.myAPI.initSystemStatus(() => {
            dispatch(changeSystemStatus(0));
            dispatch(changeShowButtonStatus(0));
          });

          // ①
          window.myAPI.scrapingResult(handleScrapingResult);

          // ②
          window.myAPI.loadTransferData((event, loadedTransferData) => {
            dispatch(updateWithLoadedData(loadedTransferData));
          });

          // // ③
          // const loadedData = await window.myAPI.loadData();
          // dispatch(updateWithLoadedData(loadedData));

          // ④
          const unsubscribe = await listenAuthState();

          // ⑤
          // 引数はリスナーのコールバック関数で
          // 関数自体を渡す必要があるため
          // ()なしで関数名のみ記述
          await window.myAPI.initLogout(initLogoutCallBack);

          // ⑥ ウインドウ生成時に毎回ログイン処理をしてしまってるので
          // isAutoLogInがtrueの場合のみログイン処理を実行
          if (
            userRef.current.isAutoLogIn === true &&
            userRef.current.email &&
            userRef.current.password
          ) {
            await window.myAPI.initLogin(async () => {
              await handleLogIn();
            });
          }

          // ⑦ 定時スクレイピングの設定がTrueの場合
          // 保存されてる指定時刻に予約をセッティングします。
          if (
            systemStatusRef.current.isScheduledScrapingAble === true &&
            userRef.current.isAutoLogIn === true &&
            userRef.current.isAuthed === true &&
            (userRef.current.plan === "s" || userRef.current.plan === "p")
          ) {
            await window.myAPI.initScheduledTime(() => {
              window.myAPI.scheduledScraping(
                systemStatusRef.current.scheduledScrapingTime,
              );
            });
          }

          // ⑧ メインプロセスの定時スクレイピング実行をリスンして状態変数を更新
          window.myAPI.startScheduledScraping(() => {
            dispatch(changeSystemStatus(1));
            dispatch(changeShowButtonStatus(1));
            dispatch(updateIsScrapingTrueAll());
          });

          // ⑨
          // 有料プランにログインしてる場合に実行
          // ■ 同日に前回の処理が中断されている場合の自動処理
          if (
            asinDataListRef.current.length > 0 &&
            userRef.current.isAutoLogIn === true &&
            userRef.current.isAuthed === true &&
            (userRef.current.plan === "s" || userRef.current.plan === "p")
          ) {
            await window.myAPI.initScraping(async () => {
              await handleInitScraping();
            });
          }

          return () => {
            // preload.tsの登録関数で設置したリスナーを全てdispose
            window.myAPI.disposeAllListeners();
            // ④ のリスナーをdispose
            unsubscribe();
          };
        } catch (error) {
          console.log("アプリ立ち上げの初期化処理エラー:", error);
        }
      })();
    }
  }, []);
  // }, [handleScrapingResult]);
  // 不具合が生じた際は、,[]の追跡を
  // コメントアウトしてるhandleScrapingResultに戻して
  // handleScrapingResultの宣言の後にuseEffectを再配置する

  // 自動ログインのコールバック
  const handleLogIn = async () => {
    console.log("init login done");
    const userCredential = await logInWithEmailAndPassword(
      userRef.current.email!,
      userRef.current.password!,
    );

    // オブジェクトが存在し
    // string型（エラーメッセージ）ではない場合は
    // 取得成功してる
    if (userCredential && typeof userCredential !== "string") {
      // ■ userCredential.user.uid と一致するドキュメントが存在する場合
      // firestoreからドキュメントデータを取得
      // プラン名とアカウント作成日を取得し、割り当てる
      const userDocData: DocumentData | undefined = await getUserDoc(
        userCredential.user.uid,
      );

      if (userDocData) {
        // 最新のUserオブジェクトを生成
        const newUser: User = {
          uid: userCredential.user.uid,
          email: userRef.current.email,
          password: userRef.current.password,
          isAuthed: true,
          isAutoLogIn: userRef.current.isAutoLogIn,
          is_cancel_progress: false,
          plan: userDocData["plan"] ?? "not found",
          createdAt: userDocData["created_at"] ?? "not found",
        };

        // ストアのUserオブジェクトを更新
        dispatch(updateUser(newUser));
      }
    }
  };

  const handleInitScraping = async () => {
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const checkArray = asinDataListRef.current.find((asinData: AsinData) => {
      // 以下２点を満たすとTrue
      // ・スクレイピングが取得中
      // ・今日の日付のStockCountDataが存在してる
      return (
        asinData.isScraping === true &&
        (asinData.fbaSellerDatas.some((fbaSellerData) =>
          fbaSellerData.stockCountDatas.some((stockCountData) =>
            Object.keys(stockCountData).includes(todayFormatted),
          ),
        ) ||
          asinData.fetchLatestDate === "")
      );
    });

    if (checkArray) {
      console.log("同日に前回処理が中断された際の自動フォローアップ起動");
      // システムメッセージ表示フラグ
      //「アプリ終了で中断された取得処理を自動で...」
      dispatch(changeSystemStatus(2));
      window.myAPI.runScraping(asinDataListRef.current);
    }
  };

  /// メインプロセスからスクレイピングデータを
  /// 取得した際のコールバック関数
  /// useCallbackを使用して関数の参照を安定させる
  const handleScrapingResult = useCallback(
    (
      event: Electron.IpcRendererEvent,
      asinData: AsinData | null,
      isEnd: boolean | null,
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
    [dispatch],
  );
  return <></>;
};

export default BackGroundWindow;
