import { store } from "../redux/store";
import { useNavigate } from "react-router-dom";
import "./Top.css";
import { useDispatch, useSelector } from "react-redux";
import {
  removeAsin,
  switchRemoveCheck,
  updateIsScrapingTrueAll,
  switchIsDeleteCheckAll,
  setIsScrapingTrueForNewItems,
} from "../slices/asinDataListSlice";
import {
  changeSystemStatus,
  changeShowButtonStatus,
} from "../slices/systemStatusSlice";
import { useEffect, useRef, useState } from "react";
import {
  calculateDataForChart,
  calculateDecreaseLatestToPrevEl,
  prepareDataForCalculateDecrease,
} from "../util/calculateDecrease";
import { calculateRemainingTime } from "../util/calculateRemainingTime";
import ConfirmReExcuteDialog from "../components/main-window/top/ConfirmReExcuteDialog";
import {
  AppBar,
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { ConfirmDeleteDataDialog } from "../components/main-window/ConfirmDeleteDataDialog";
import DoneIcon from "@mui/icons-material/Done";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import { Footer } from "../components/main-window/Footer";
import { AsinDataTable } from "../components/main-window/top/AsinDataTable";
import LoginFormDialog from "../components/main-window/top/LoginFormDialog";
import PlanList from "../components/plan/PlanList";
import { fetchSessionIdOnFirestore } from "../firebase/firestore";
import { logOut } from "../firebase/authentication";
import { BlockMultiLoginSnackBar } from "../components/main-window/top/BlockMultiLoginSnackBar";
import {
  changeIsAuthed,
  changeIsAutoLogIn,
  changePlanOnStore,
} from "../slices/userSlice";

function Top() {
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value,
  );
  const asinDataListRef = useRef(asinDataList);
  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  // システム関係の状態変数の取得
  const systemStatus: number = useSelector(
    (state: RootState) => state.systemStatus.value.systemStatus,
  );
  const showButtonStatus = useSelector(
    (state: RootState) => state.systemStatus.value.showButtonStatus,
  );

  useEffect(() => {
    if (systemStatus === 6) {
      setIsOpenBlockMultiLoginSnackBar(true);
      dispatch(changeSystemStatus(0));
    }
  }, [systemStatus]);

  // ユーザーの状態変数の取得
  const user = useSelector((state: RootState) => state.user.value);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
    // console.log(
    //   "userRef.current.sessionId in useEffect",
    //   userRef.current.sessionId,
    // );
  }, [user]);

  // dispatch: storeへのreducer起動のお知らせ役
  // dispatch関数を取得し、
  // その型をAppDispatchとして指定することで
  // アクションをディスパッチする際に型安全性が確保されます。
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [asinDataListCount, setAsinDataListCount] = useState<number>(0);
  const [scrapeTimeLeft, setScrapeTimeLeft] = useState(0);
  const [asinQuery, setAsinQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [parentQuery, setParentQuery] = useState("");
  const [searchType, setSearchType] = useState("asin");
  const [isRunScrapingButtonDisabled, setIsRunScrapingButtonDisabled] =
    useState(false);
  const [filteredAsinDataList, setFilteredAsinDataList] = useState<AsinData[]>(
    asinDataListRef.current,
  );
  const [isOpenConfirmReExcuteDialog, setIsOpenConfirmReExcuteDialog] =
    useState<boolean>(false);

  const [isOpenConfirmDeleteDataDialog, setIsOpenConfirmDeleteDataDialog] =
    useState<boolean>(false);

  const [isOpenLoginFormDialog, setIsOpenLoginFormDialog] =
    useState<boolean>(false);

  const [isOpenPlanListDialog, setIsOpenPlanListDialog] =
    useState<boolean>(false);

  const [isOpenBlockMultiLoginSnackBar, setIsOpenBlockMultiLoginSnackBar] =
    useState<boolean>(false);

  const handleAsinQuery = (inputData: string) => {
    setAsinQuery(inputData);
    setSearchType("asin");
  };
  const handleNameQuery = (inputData: string) => {
    setNameQuery(inputData);
    setSearchType("name");
  };
  const handleParentQuery = (inputData: string) => {
    setParentQuery(inputData);
    setSearchType("parent");
  };

  // filteredAsinDataListを更新、再描画する関数
  useEffect(() => {
    const newFilteredList = asinDataListRef.current.filter(
      (asinData: AsinData) => {
        // 各クエリの結果を以下のように取得する
        // ① クエリが空の場合はTrue
        // ② クエリがある場合は包含要素を返す（=True）
        const asinMatch = !asinQuery || asinData.asin.includes(asinQuery);
        const nameMatch = !nameQuery || asinData.name.includes(nameQuery);
        const parentMatch =
          !parentQuery || asinData.asinParent.includes(parentQuery);

        // 各結果がすべてTrueの場合のみ
        // つまり、3つのクエリ全てに合致する要素のみtrueを返し
        // 新規配列に追加する
        return asinMatch && nameMatch && parentMatch;
      },
    );

    setFilteredAsinDataList(newFilteredList);
    // 各クエリと元データのasinDataListの変更を追跡して
    // 最新のフィルター状態を反映する。
  }, [asinQuery, nameQuery, parentQuery, searchType, asinDataList]);

  /// 「取得開始」ボタンのハンドリング関数
  const handleScrapingButton = async () => {
    // ボタンを無効化する
    setIsRunScrapingButtonDisabled(true);
    // 1秒後にボタンを再度有効化する
    setTimeout(() => {
      setIsRunScrapingButtonDisabled(false);
    }, 1250);

    // セッションIDの照合でアカウント認証をするために
    // Firestore上の現在のセッションIDを事前に取得しておきます。
    const sessionIdOnFiretore: string | undefined =
      await fetchSessionIdOnFirestore(userRef.current.uid);
    // const sessionIdOnLocal = store.getState().user.value.sessionId;

    console.log("取得開始を押下時 sessionIdOnFiretore", sessionIdOnFiretore);
    console.log(
      "取得開始を押下時 userRef.current.sessionId",
      userRef.current.sessionId,
    );

    // ■ ログインウインドウの表示
    if (userRef.current.isAuthed === false) {
      console.log("1 handleScrapingButton ");
      // window.myAPI.openLoginPrompt();
      setIsOpenLoginFormDialog(true);

      // ■ 同一アカウントの複数ログインをセッションIDでチェック
      // 一致しない場合 => ダイアログの表示 & ログアウト。
    } else if (userRef.current.sessionId !== sessionIdOnFiretore) {
      // ログアウト
      await logOut();
      dispatch(changeIsAuthed(false));
      dispatch(changePlanOnStore(""));
      dispatch(changeShowButtonStatus(0));
      dispatch(changeSystemStatus(0));

      // ダイアログの表示
      setIsOpenBlockMultiLoginSnackBar(true);
      console.log("sessionIdOnLocal", userRef.current.sessionId);
      console.log(
        "store.getState().user.value.sessionId",
        store.getState().user.value.sessionId,
      );
      console.log("sessionIdOnFiretore", sessionIdOnFiretore);

      // ■ freeプランユーザーの場合
      // プラン加入ページへ誘導
    } else if (
      userRef.current.isAuthed === true &&
      userRef.current.plan === "f" &&
      userRef.current.isLockedRunScraping === true
    ) {
      console.log("2 handleScrapingButton");

      // プランリストのダイアログを表示
      setIsOpenPlanListDialog(true);

      // ■ 待機状態での「取得開始」のクリック
    } else if (
      userRef.current.isAuthed === true &&
      [0, 4, 5].includes(systemStatus) &&
      asinDataListRef.current.length > 0
    ) {
      console.log("3 handleScrapingButton");

      // スクレイピングを開始
      dispatch(changeShowButtonStatus(1));
      handleRunScraping();

      // スクレイピング中の「取得停止」のクリック
    } else if (
      userRef.current.isAuthed === true &&
      [1, 2, 3].includes(systemStatus) &&
      showButtonStatus === 1
    ) {
      console.log("4 handleScrapingButton");
      // 「本当に？」UIを表示
      dispatch(changeShowButtonStatus(2));

      // スクレイピング中の「本当に？」のクリック
    } else if (
      userRef.current.isAuthed === true &&
      [1, 2, 3].includes(systemStatus) &&
      showButtonStatus === 2
    ) {
      console.log("5 handleScrapingButton");

      // スクレイピングの終了処理を実行
      dispatch(changeShowButtonStatus(0));
      window.myAPI.stopScraping();
    }
  };

  /// スクレイピングを実行する際の
  /// 「データの下準備と実行」の管理をする関数
  const handleRunScraping = async () => {
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // 全てのasinDataが取得完了の状態
    // everyメソッドは配列の各要素に対してコールバック関数を実行し、
    // その関数がtrueを返した場合にのみ、
    // その要素が条件を満たすと見なします。
    // すべての要素が条件を満たす
    // （つまり、すべてのコールバック関数がtrueを返す）場合にのみ、
    // everyメソッドはtrueを返します。
    const isScrapingFalseAll: boolean = asinDataListRef.current.every(
      (asinData: AsinData) => {
        return asinData.isScraping === false;
      },
    );

    // データ取得日が当日の要素を保持してるasinDataが
    // 少なくとも1つ存在する。
    const isDoneTodayAtLeast1 = asinDataListRef.current.find(
      (asinData: AsinData) => {
        return asinData.fbaSellerDatas.some((fbaSellerData) =>
          fbaSellerData.stockCountDatas.some((stockCountData) =>
            Object.keys(stockCountData).includes(todayFormatted),
          ),
        );
      },
    );

    // fetchLatestDateが空文字のアイテムが少なくとも1つ存在するかを確認
    // 意図：まだスクレイピングされたことのない登録したばかりのデータがあるかの確認
    const hasNewItems = asinDataListRef.current.some((asinData: AsinData) => {
      return asinData.fetchLatestDate === "";
    });

    if (isScrapingFalseAll && isDoneTodayAtLeast1) {
      console.log("■ 1 handleRunScraping");
      // 日付データの一貫性は保たれているので、
      // 全てのデータ取得が完了状態で
      // かつ
      // 1つでも今日の日付のものがあるなら
      // 本日のデータ取得を完了していることを意味するので
      // runScrapingを実行しない
      console.log("当日のデータ取得が既に完了していて何もしない場合");
      setIsOpenConfirmReExcuteDialog(true);
    } else if (isScrapingFalseAll && !isDoneTodayAtLeast1) {
      console.log("■ 2 handleRunScraping");
      // 全てのデータ取得が完了状態で
      // かつ
      // 取得状態が本日付のデータが1つもないなら
      // 全てのデータをrunScrapingにかければ良い
      dispatch(updateIsScrapingTrueAll());
      await new Promise((resolve) => setTimeout(resolve, 200)); // 状態変数の更新が完了するまで200ms待機
      window.myAPI.runScraping(asinDataListRef.current);
      dispatch(changeSystemStatus(1));
      dispatch(changeShowButtonStatus(1));
      console.log("■ 2 handleRunScraping systemStatus =", systemStatus);
    } else {
      console.log("■ 3 handleRunScraping");
      // ■ 同日に前回の処理が中断されている場合の処理
      // 以下２点を満たすとTrue
      //「スクレイピングが取得中のデータが存在し」
      // かつ
      //「本日付の取得完了データがある or 初回スクレイピングが中断されて取得状態のないデータがある
      const checkArray = asinDataListRef.current.find((asinData: AsinData) => {
        return (
          asinData.isScraping === true &&
          (isDoneTodayAtLeast1 || asinData.fetchLatestDate === "")
        );
      });

      if (checkArray) {
        console.log("■ 4 handleRunScraping");
        console.log("同日に前回の処理が中断されている場合の処理");
        // システムメッセージ表示フラグ
        //「アプリ終了で中断された取得処理を自動で...」
        window.myAPI.runScraping(asinDataListRef.current);
        dispatch(changeSystemStatus(2));
        dispatch(changeShowButtonStatus(1));
      } else if (hasNewItems) {
        console.log("■ 5 handleRunScraping");
        console.log("同日データ取得が無事完了 && 新規アイテムの追加がある場合");
        // ■ 同日にデータ取得が無事完了している && 新規アイテムの追加がある場合
        // fetchlatestdateが空文字のアイテムが少なくとも1つある場合
        // 新規アイテムのみを isScraping === trueに変更して引数に渡す
        dispatch(setIsScrapingTrueForNewItems());
        await new Promise((resolve) => setTimeout(resolve, 200)); // 状態変数の更新が完了するまで200ms待機
        window.myAPI.runScraping(asinDataListRef.current);
        dispatch(changeSystemStatus(3));
        dispatch(changeShowButtonStatus(1));
      } else {
        console.log("■ 6 handleRunScraping");
        dispatch(updateIsScrapingTrueAll());
        await new Promise((resolve) => setTimeout(resolve, 200)); // 状態変数の更新が完了するまで200ms待機
        window.myAPI.runScraping(asinDataListRef.current);
        dispatch(changeSystemStatus(1));
        dispatch(changeShowButtonStatus(1));
      }
    }
  };

  const handleDeleteCheck = (id: string) => {
    dispatch(switchRemoveCheck(id));
  };

  const handleDecrease2 = (asinData: AsinData) => {
    const data = prepareDataForCalculateDecrease(asinData);
    const result = calculateDataForChart(data, true).newTotalDecrease;
    return result;
  };

  /// スクレイピング残り時間の表示を動的に変更します。
  useEffect(() => {
    const remainingTime = calculateRemainingTime(asinDataListRef.current);
    setScrapeTimeLeft(remainingTime);
  }, [asinDataList]);

  /// ASIN数のカウント関数
  useEffect(() => {
    const asinDataListCount = asinDataListRef.current.length;
    setAsinDataListCount(asinDataListCount);
  }, [asinDataListRef.current.length]);

  /// runScrapingの完了時に「取得停止」の表示の状態を
  /// 「取得開始」の表示の状態切り替える関数
  useEffect(() => {
    if (systemStatus === 2) {
      dispatch(changeShowButtonStatus(1));

      // systemStatusの変更が 5 の場合は
      // メインプロセスからの取得データの結果を
      // 受信したコールバックでの変更なので
      // そのコールバックでボタンを初期化する
    } else if (systemStatus === 5) {
      dispatch(changeShowButtonStatus(0));
    }
  }, [systemStatus]);

  return (
    <div className="App">
      {/* メニュー部分 */}
      <Box
        className="top-square-space-menu"
        component={"div"}
        sx={{
          marginTop: "0px",
          marginBottom: "17.5px",
          boxShadow: 2, // 影のレベルを指定
        }}
      >
        <div className="top-square-space-menu-container-left">
          {/* Scraperコンポーネントの実行ボタン */}
          <Button
            className="top-square-space-menu-container-left-scraping"
            disabled={isRunScrapingButtonDisabled}
            onClick={() => handleScrapingButton()}
            variant="contained"
            sx={{
              backgroundColor: "#7a6dff",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#CB0000", // ホバー時の背景色
              },
              "&.Mui-disabled": {
                opacity: 1, // グレーアウトを無効に
                backgroundColor: "#7a6dff", // 無効時の背景色を設定
                color: "white", // 無効時のテキストカラーを設定
                cursor: "not-allowed", // 無効時のカーソルを設定
              },
            }}
          >
            {showButtonStatus === 0
              ? "取得開始"
              : showButtonStatus === 1
              ? "取得停止"
              : showButtonStatus === 2
              ? "本当に？"
              : null}
          </Button>

          <Button
            className="top-square-space-menu-container-select-plan"
            onClick={() => setIsOpenPlanListDialog(true)}
            variant="contained"
            sx={{
              backgroundColor: "#7a6dff",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#CB0000", // ホバー時の背景色
              },
            }}
          >
            プラン変更
          </Button>

          {/* ASIN検索入力欄 */}
          <TextField
            className="top-square-space-menu-container-left-input"
            label="検索するASINを入力"
            variant="standard"
            value={asinQuery}
            onChange={(event) => handleAsinQuery(event.target.value)}
            InputLabelProps={{
              style: { fontSize: "15px" },
            }}
          />
        </div>

        <div className="top-square-space-menu-container-center">
          <TextField
            className="top-square-space-menu-container-center-input"
            value={nameQuery}
            label="検索する商品名を入力"
            variant="standard"
            onChange={(event) => {
              handleNameQuery(event.target.value);
            }}
            InputLabelProps={{
              style: { fontSize: "15px" },
            }}
          />
          <Button
            className="top-square-space-menu-container-center-delete-button"
            onClick={() => {
              setIsOpenConfirmDeleteDataDialog(true);
            }}
            variant="contained"
            sx={{
              backgroundColor: "#7a6dff",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#CB0000", // ホバー時の背景色
              },
            }}
          >
            チェックしたASINを削除
          </Button>
          <p className="top-square-space-menu-container-center-asin-num">
            {`登録ASIN数：${asinDataListRef.current.length}`}
          </p>
        </div>
        <div className="top-square-space-menu-container-right">
          <TextField
            className="top-square-space-menu-container-right-input"
            value={parentQuery}
            label="検索する親ASINを入力"
            variant="standard"
            onChange={(event) => handleParentQuery(event.target.value)}
            InputLabelProps={{
              style: { fontSize: "15px" },
            }}
          />
        </div>
      </Box>
      {/* リスト部分 */}
      <AsinDataTable filteredAsinDataList={filteredAsinDataList} />
      {/* フッター部分のコンポーネントです。 */}
      <Footer scrapeTimeLeft={scrapeTimeLeft} />
      <div>
        <ConfirmReExcuteDialog
          isOpenConfirmReExcuteDialog={isOpenConfirmReExcuteDialog}
          setIsOpenConfirmReExcuteDialog={setIsOpenConfirmReExcuteDialog}
        />
      </div>
      <div>
        <ConfirmDeleteDataDialog
          isOpenConfirmDeleteDataDialog={isOpenConfirmDeleteDataDialog}
          setIsOpenConfirmDeleteDataDialog={setIsOpenConfirmDeleteDataDialog}
        />
      </div>
      <div>
        <LoginFormDialog
          isOpenLoginFormDialog={isOpenLoginFormDialog}
          setIsOpenLoginFormDialog={setIsOpenLoginFormDialog}
        />
      </div>
      <div>
        <PlanList
          isOpenPlanListDialog={isOpenPlanListDialog}
          setIsOpenPlanListDialog={setIsOpenPlanListDialog}
        />
      </div>
      <div>
        <BlockMultiLoginSnackBar
          isOpenBlockMultiLoginSnackBar={isOpenBlockMultiLoginSnackBar}
          setIsOpenBlockMultiLoginSnackBar={setIsOpenBlockMultiLoginSnackBar}
        />
      </div>
    </div>
  );
}

export default Top;
