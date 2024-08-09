import React, { useState } from "react";
import "./AuthedScrapeSection.css";
import { useDispatch, useSelector } from "react-redux";
import {
  changeIsScheduledScrapingAble,
  changeScheduledTime,
} from "../../slices/systemStatusSlice";

const AuthedScrapeSection = () => {
  const asinDataList: AsinData[] = useSelector(
    (state: RootState) => state.asinDataList.value
  );

  const systemStatus: any = useSelector(
    (state: RootState) => state.systemStatus.value
  );

  const user = useSelector((state: RootState) => state.user.value);

  // 定時スクレイピングのON/OFFのチェックボックスの状態管理に用いる変数
  const [isScheduledScrapingAble, setIsScheduledScrapingAble] =
    useState<boolean>(systemStatus.isScheduledScrapingAble);

  // データ取得の指定時刻の状態管理に用いる変数
  const [inputScheduledTime, setInputScheduledTime] = useState<string>(
    systemStatus.scheduledScrapingTime
  );

  // 保存時の表示用時刻の格納変数
  const [savedScheduledTime, setSavedScheduledTime] = useState<string>("");

  // 保存ボタンを押した際のコールバックをハンドリングするための変数
  const [isScrapeTimeChanged, setIsScrapeTimeChanged] = useState<
    boolean | null
  >(null);

  const dispatch = useDispatch<AppDispatch>();

  // 定時スクレイピングのON/OFFのチェックボックスのコールバックです
  const handleCheckBox = (checked: boolean) => {
    // UIの切り替えと状態の更新
    setIsScheduledScrapingAble(checked);
    dispatch(changeIsScheduledScrapingAble(checked));
    if (checked === true) {
      // チェックをつける場合は
      // 保存済みの予約時刻を引数にして
      // メインプロセスに予約リクエスト
      window.myAPI.scheduledScraping(inputScheduledTime);
    } else if (checked === false) {
      // チェックを外す場合は
      // 予約済みのタスクを
      // メインプロセスでキャンセルする必要がある
      window.myAPI.stopScheduledScraping();
    }
  };

  // 保存ボタンを押した際のコールバックです。
  const handleSaveScheduledTime = (inputTime: string) => {
    setInputScheduledTime(inputTime);
    dispatch(changeScheduledTime(inputTime));
  };

  // 定時スクレイピングの予約処理をハンドルします。
  const handleScheduledScraping = () => {
    setIsScrapeTimeChanged(true);
    setSavedScheduledTime(inputScheduledTime);

    // 条件に合致する場合のみ、メインプロセスに予約処理をリクエスト
    if (
      systemStatus.isScheduledScrapingAble === true &&
      (user.plan === "s" || user.plan === "p")
    ) {
      window.myAPI.scheduledScraping(inputScheduledTime);
    }
  };

  return (
    <>
      <h2 className="authed-scrape-section-h2">データ取得設定</h2>
      <div className="authed-scrape-section">
        <div className="authed-scrape-section-item">
          <p>
            毎日指定した時刻に
            <br />
            自動でデータを取得
          </p>
          <input
            className="authed-scrape-section-item-value-1"
            checked={isScheduledScrapingAble}
            type="checkbox"
            onChange={(event) => {
              handleCheckBox(event.target.checked);
            }}
          />
        </div>
        <div className="authed-scrape-section-item">
          <p>時刻の指定：</p>
          <input
            type="time"
            value={inputScheduledTime}
            className="authed-scrape-section-item-value-2"
            onChange={(event) => {
              handleSaveScheduledTime(event.target.value);
            }}
          />
        </div>
        <button
          onClick={() => {
            handleScheduledScraping();
          }}
        >
          保存
        </button>
        <p className="authed-scrape-section-result">
          {isScrapeTimeChanged === null
            ? ""
            : isScrapeTimeChanged
            ? `時刻を${savedScheduledTime}で保存しました（指定時刻にアプリを起動してログインしていない場合、また、プラン未加入の場合は実行されません）`
            : "システムエラーです。運営者にお問い合わせください。"}
        </p>
      </div>
    </>
  );
};

export default AuthedScrapeSection;
