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

function Top() {
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );
  const asinDataListRef = useRef(asinDataList);
  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  // システム関係の状態変数の取得
  const systemStatus: number = useSelector(
    (state: RootState) => state.systemStatus.value.systemStatus
  );
  const showButtonStatus = useSelector(
    (state: RootState) => state.systemStatus.value.showButtonStatus
  );

  // ユーザーの状態変数の取得
  const user = useSelector((state: RootState) => state.user.value);

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
  const [filteredAsinDataList, setFilteredAsinDataList] = useState<AsinData[]>(
    asinDataListRef.current
  );

  const gotoAmazonURL = (asin: string) => {
    const amazonURL = `https://www.amazon.co.jp/dp/${asin}`;
    window.myAPI.openExternal(amazonURL);
  };
  const gotoPlanURL = () => {
    const planURL = `https://www.google.co.jp/`;
    window.myAPI.openExternal(planURL);
  };

  /// 最後に入力のあった検索クエリ欄のタイプが設定され
  /// それの値で現在ユーザーの利用してる検索モードを判別します。
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
      }
    );

    setFilteredAsinDataList(newFilteredList);
    // 各クエリと元データのasinDataListの変更を追跡して
    // 最新のフィルター状態を反映する。
  }, [asinQuery, nameQuery, parentQuery, searchType, asinDataList]);

  /// スクレイピングボタンを押した際の
  /// 条件分岐を管理する関数
  const handleScrapingButton = (
    asinDataList: AsinData[],
    showButtonStatus: number
  ) => {
    // ■ ログインウインドウの表示
    if (user.isAuthed === false) {
      console.log("1");
      window.myAPI.openLoginPrompt();

      // ■ freeプランユーザーの場合
      // プラン加入ページへ誘導
    } else if (user.isAuthed === true && user.plan === "f") {
      gotoPlanURL();

      // ■ 待機状態での「取得開始」のクリック
    } else if (
      user.isAuthed === true &&
      (user.plan === "s" || user.plan === "p") &&
      [0, 4, 5].includes(systemStatus) &&
      asinDataListRef.current.length > 0
    ) {
      // スクレイピングを開始
      dispatch(changeShowButtonStatus(1));
      handleRunScraping(asinDataList);

      // スクレイピング中の「取得停止」のクリック
    } else if (
      user.isAuthed === true &&
      (user.plan === "s" || user.plan === "p") &&
      [1, 2, 3].includes(systemStatus) &&
      showButtonStatus === 1
    ) {
      // 「本当に？」UIを表示
      dispatch(changeShowButtonStatus(2));

      // スクレイピング中の「本当に？」のクリック
    } else if (
      user.isAuthed === true &&
      (user.plan === "s" || user.plan === "p") &&
      [1, 2, 3].includes(systemStatus) &&
      showButtonStatus === 2
    ) {
      // スクレイピングの終了処理を実行
      dispatch(changeShowButtonStatus(0));
      window.myAPI.stopScraping();
    }
  };

  /// スクレイピングを実行する際の
  /// 「データの下準備と実行」の管理をする関数
  const handleRunScraping = async (asinDataList: AsinData[]) => {
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // 全てのasinDataが取得完了の状態
    const isScrapingFalseAll = asinDataListRef.current.every(
      (asinData: AsinData) => {
        return asinData.isScraping === false;
      }
    );

    // データ取得日が当日の要素を保持してるasinDataが
    // 少なくとも1つ存在する。
    const isDoneTodayAtLeast1 = asinDataListRef.current.find(
      (asinData: AsinData) => {
        return asinData.fbaSellerDatas.some((fbaSellerData) =>
          fbaSellerData.stockCountDatas.some((stockCountData) =>
            Object.keys(stockCountData).includes(todayFormatted)
          )
        );
      }
    );

    // fetchLatestDateが空文字のアイテムが少なくとも1つ存在するかを確認
    const hasNewItems = asinDataListRef.current.some((asinData: AsinData) => {
      return asinData.fetchLatestDate === "";
    });

    if (isScrapingFalseAll && isDoneTodayAtLeast1) {
      // 当日のデータ取得が完了してるので
      // runScrapingを実行しない
      console.log("当日のデータ取得が既に完了していて何もしない場合");
      dispatch(changeSystemStatus(4));
      dispatch(changeShowButtonStatus(0));
    } else {
      // ■ 同日に前回の処理が中断されている場合の処理
      // 以下２点を満たすとTrue
      // ・スクレイピングが取得中
      // ・今日の日付のStockCountDataが存在してる
      const checkArray = asinDataListRef.current.find((asinData: AsinData) => {
        return (
          asinData.isScraping === true &&
          (isDoneTodayAtLeast1 || asinData.fetchLatestDate === "")
        );
      });

      if (checkArray) {
        console.log("同日に前回の処理が中断されている場合の処理");
        // システムメッセージ表示フラグ
        //「アプリ終了で中断された取得処理を自動で...」
        window.myAPI.runScraping(asinDataListRef.current);
        dispatch(changeSystemStatus(2));
      } else if (hasNewItems) {
        // ■ 同日にデータ取得が無事完了している && 新規アイテムの追加がある場合
        // 新規アイテムのみを isScraping === trueに変更して引数に渡す

        // fetchlatestdateが空文字のアイテムが少なくとも1つある場合
        // trueの場合にisScraping = true;
        console.log("同日データ取得が無事完了 && 新規アイテムの追加がある場合");
        // 追加された新規ASINのみの
        // isScrapingをTrueにするメソッド
        dispatch(setIsScrapingTrueForNewItems());
        window.myAPI.runScraping(asinDataListRef.current);
        dispatch(changeSystemStatus(3));
      } else {
        dispatch(updateIsScrapingTrueAll());
        window.myAPI.runScraping(asinDataList);
        dispatch(changeSystemStatus(1));
      }
    }
  };

  /// チェックしたAsinリストを削除して
  /// ストレージを最新に更新する関数
  const handleRemoveAsin = async () => {
    dispatch(removeAsin());
    // 状態変数の更新が完了するまで200ms待機
    await new Promise((resolve) => setTimeout(resolve, 200));
    // ストレージに最新のasinDataListを保存
    await window.myAPI.saveData(asinDataListRef.current);
  };

  const handleDeleteCheck = (id: string) => {
    dispatch(switchRemoveCheck(id));
  };

  /// スクレイピング残り時間の表示を動的に変更します。
  useEffect(() => {
    // asinDataListRef.currentをイテレート処理
    // isScraping === trueの要素の時に
    // const remainingCount をインクリメント
    // 要素1つにつき１分なのでそのまま表示
    const remainingCount: number = asinDataListRef.current.reduce(
      (totalCount: number, asinData: AsinData) => {
        return asinData.isScraping === true ? ++totalCount : totalCount;
      },
      0
    );
    setScrapeTimeLeft(remainingCount);
  }, [asinDataList]);

  /// ASIN数のカウント関数
  useEffect(() => {
    const asinDataListCount = asinDataListRef.current.length;
    setAsinDataListCount(asinDataListCount);
  }, [asinDataListRef.current.length]);

  /// runScrapingの完了時に「取得停止」の表示の状態を
  /// 「取得開始」の表示の状態切り替える関数
  useEffect(() => {
    // systemStatusの変更が 5 の場合は
    // メインプロセスからの取得データの結果を
    // 受信したコールバックでの変更なので
    // そのコールバックでボタンを初期化する
    if (systemStatus === 5) {
      dispatch(changeShowButtonStatus(0));
    }
  }, [systemStatus]);

  return (
    <div className="App">
      {/* タブ部分 */}
      <div className="top-square-space-tab">
        <button
          className="top-square-space-tab-button"
          onClick={() => {
            // App.tsxでマッピングしたURLパスを指定
            navigate("/Top");
          }}
        >
          メイン画面
        </button>
        <button
          className="top-square-space-tab-button"
          onClick={() => {
            navigate("/Manage");
          }}
        >
          ASIN管理
        </button>
      </div>

      {/* メニュー部分 */}
      <div className="top-square-space-menu">
        <div className="top-square-space-menu-container-left">
          {/* Scraperコンポーネントの実行ボタン */}
          <button
            className="top-square-space-menu-container-left-scraping"
            onClick={() => handleScrapingButton(asinDataList, showButtonStatus)}
          >
            {showButtonStatus === 0
              ? "取得開始"
              : showButtonStatus === 1
              ? "取得停止"
              : showButtonStatus === 2
              ? "本当に？"
              : null}
          </button>
          {/* 全選択チェック */}
          <input
            type="checkbox"
            className="top-square-space-menu-container-left-check"
            onChange={(event) =>
              dispatch(switchIsDeleteCheckAll(event.target.checked))
            }
          />
          {/* ASIN検索入力欄 */}
          <input
            type="text"
            value={asinQuery}
            onChange={(event) => handleAsinQuery(event.target.value)}
            className="top-square-space-menu-container-left-input"
          />
        </div>

        <div className="top-square-space-menu-container-center">
          <p className="top-square-space-menu-container-center-decrease1">
            減少１：最新取得分の減少数
          </p>
          <p className="top-square-space-menu-container-center-decrease2">
            減少２：直近１週間の減少数
          </p>
          <input
            onChange={(event) => {
              handleNameQuery(event.target.value);
            }}
            value={nameQuery}
            type="text"
            className="top-square-space-menu-container-center-input"
          />
        </div>
        <div className="top-square-space-menu-container-right">
          <button
            className="top-square-space-menu-container-right-delete-button"
            onClick={() => {
              handleRemoveAsin();
            }}
          >
            チェックしたASINを削除
          </button>
          <p className="top-square-space-menu-container-right-asin-num">
            登録ASIN数：{asinDataListCount}
          </p>
          <input
            value={parentQuery}
            onChange={(event) => handleParentQuery(event.target.value)}
            type="text"
            className="top-square-space-menu-container-right-input"
          />
        </div>
      </div>

      {/* リスト全体 */}
      <div className="top-globalList">
        {/* リストヘッダー部分 */}
        <div className="top-asin-list-header">
          {/* 要素0 チェック */}
          <div className="top-square-space-asin-delete">削除</div>
          {/* 要素1 ASIN */}
          <div className="top-square-space-asin">{<p>ASIN</p>}</div>

          {/* 要素2 3ボタン */}
          <div className="top-square-space-3button">
            <div className="top-square-space-3buttonp-elements">
              <p></p>
            </div>
          </div>

          {/* 要素3 画像 */}
          <div className="top-square-space-img">
            <p>画像</p>
          </div>

          {/* 要素4 商品名 */}
          <div className="top-square-space-name">
            <p>商品名</p>
          </div>

          {/* 要素5 Amazon在庫数 */}
          <div className="top-square-space-amazon-num">
            <p>AMAZON</p>
          </div>

          {/* 要素6 FBAセラー数 */}
          <div className="top-square-space-amazon-num">
            <p>FBA数</p>
          </div>

          {/* 要素7 合計在庫 */}
          <div className="top-square-space-amazon-num">
            <p>合計在庫</p>
          </div>

          {/* 要素8 カート価格 */}
          <div className="top-square-space-amazon-num">
            <p>カート価格</p>
          </div>

          {/* 要素9 本日の減少数 */}
          <div className="top-square-space-amazon-num">
            <p>減少１</p>
          </div>

          {/* 要素10 週間の減少数 */}
          <div className="top-square-space-amazon-num">
            <p>減少２</p>
          </div>

          {/* 要素11 最新取得 */}
          <div className="top-square-space-update-latest">
            <p>最新取得</p>
          </div>

          {/* 要素12 取得状況 */}
          <div className="top-square-space-update-state">
            <p>取得状況</p>
          </div>

          {/* 要素13 親ASIN */}
          <div className="top-square-space-asin">{<p>親ASIN</p>}</div>
        </div>

        <div className="top-asinArray-map-wrapper-top-css">
          {/* リスト部分 */}
          {filteredAsinDataList.map((asinData: AsinData) => (
            <div className="top-asin-list">
              {/* 要素0 チェック */}
              <div className="top-square-space-asin-delete">
                <label>
                  <input
                    type="checkbox"
                    onChange={() => {
                      handleDeleteCheck(asinData.id);
                    }}
                    checked={asinData.isDeleteCheck}
                  />
                </label>
              </div>

              {/* 要素1 ASIN */}
              <div className="top-square-space-asin">
                {<p>{asinData.asin}</p>}
              </div>

              {/* 要素2 3ボタン */}
              <div className="top-square-space-3button">
                <div className="top-square-space-3buttonp-elements">
                  {/* <button className="top-square-space-each-button">
                    出品者一覧
                  </button> */}
                  <button
                    className="top-square-space-each-button"
                    onClick={() => {
                      gotoAmazonURL(asinData.asin);
                    }}
                  >
                    商品URL
                  </button>
                  <button
                    className="top-square-space-each-button"
                    onClick={() => {
                      window.myAPI.openStockDetail(asinData);
                    }}
                  >
                    在庫データ
                  </button>
                </div>
              </div>

              {/* 要素3 画像 */}
              <div className="top-square-space-img">
                <img src={asinData.imageURL} alt="" />
              </div>

              {/* 要素4 商品名 */}
              <div className="top-square-space-name">
                {<p>{asinData.name}</p>}
              </div>

              {/* 要素5 Amazon在庫数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.amazonStock}</p>
              </div>

              {/* 要素6 FBAセラー数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.fbaSellerNOP}</p>
              </div>

              {/* 要素7 合計在庫数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.totalStock}</p>
              </div>

              {/* 要素8 カート価格 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.cartPrice}</p>
              </div>

              {/* 要素9 本日の減少数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.decrease1 === -1 ? "" : asinData.decrease1}</p>
              </div>

              {/* 要素10 週間の減少数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.decrease2 === -1 ? "" : asinData.decrease2}</p>
              </div>

              {/* 要素11 最新取得 */}
              <div className="top-square-space-update-latest">
                <p>{asinData.fetchLatestDate}</p>
                <p>{asinData.fetchLatestTime}</p>
              </div>

              {/* 要素12 取得状況 */}
              <div className="top-square-space-update-state">
                <p>
                  {asinData.isScraping === null
                    ? ""
                    : asinData.isScraping === true
                    ? "取得中"
                    : "取得完了"}
                </p>
              </div>

              {/* 要素13 親ASIN */}
              <div className="top-square-space-asin">
                {<p>{asinData.asinParent}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="top-bottom-container">
        <p>
          {systemStatus === 0
            ? ""
            : systemStatus === 1
            ? `データ取得中...残り${scrapeTimeLeft}分`
            : systemStatus === 2
            ? `前回のデータ取得処理が途中で中断されました。続きのデータを取得中...残り${scrapeTimeLeft}分`
            : systemStatus === 3
            ? `追加されたASINのデータを取得しています`
            : systemStatus === 4
            ? `本日分のデータ取得は既に完了しています。`
            : systemStatus === 5
            ? `データ取得が完了しました。`
            : `System cord e`}
        </p>
      </div>
    </div>
  );
}

export default Top;
