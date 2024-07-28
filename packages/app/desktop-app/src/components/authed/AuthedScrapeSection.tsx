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

  // 保存ボタンを押した際のコールバックをハンドリングするための変数
  const [isScrapeTimeChanged, setIsScrapeTimeChanged] = useState<
    boolean | null
  >(null);

  const dispatch = useDispatch<AppDispatch>();

  // 定時スクレイピングのON/OFFのチェックボックスのコールバックです
  const handleCheckBox = (checked: boolean) => {
    setIsScheduledScrapingAble(checked);
    dispatch(changeIsScheduledScrapingAble(checked));
  };

  // 保存ボタンを押した際のコールバックです。
  const handleSaveScheduledTime = (inputTime: string) => {
    setInputScheduledTime(inputTime);
    dispatch(changeScheduledTime(inputTime));
  };

  // 定時スクレイピングの予約処理を実行します。
  const handleScheduledScraping = () => {
    window.myAPI.scheduledScraping(inputScheduledTime, asinDataList);
    setIsScrapeTimeChanged(true);
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
            ? "時刻を保存しました（指定の時刻にアプリが起動していない場合、また、プラン未加入の場合は実行されません）"
            : "システムエラーです。運営者にお問い合わせください。"}
        </p>
      </div>
    </>
  );
};

export default AuthedScrapeSection;
