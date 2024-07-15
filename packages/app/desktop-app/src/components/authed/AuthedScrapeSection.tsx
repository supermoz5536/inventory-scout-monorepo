import React, { useState } from "react";
import "./AuthedScrapeSection.css";
import { useSelector } from "react-redux";

const AuthedScrapeSection = () => {
  let time: string = "00:00";
  let isAutoScraping: boolean = false;
  const asinDataList: AsinData[] = useSelector(
    (state: RootState) => state.asinDataList.value
  );
  const systemStatus: number = useSelector(
    (state: RootState) => state.systemStatus.value.systemStatus
  );
  const user = useSelector((state: RootState) => state.user.value);
  const [isScrapeTimeChanged, setIsScrapeTimeChanged] = useState<
    boolean | null
  >(null);

  // システムステータスがスクレピングを実行中ではない場合
  // かつ
  // ログイン中の場合に
  // 定時スクレイピングを実行します
  const handlescheduledScraping = () => {
    if (![1, 2, 3].includes(systemStatus) && user.isAuthed === true) {
      window.myAPI.scheduledScraping(time, asinDataList);
      setIsScrapeTimeChanged(true);
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
            type="checkbox"
            onChange={(event) => {
              isAutoScraping = event.target.checked;
            }}
          />
        </div>
        <div className="authed-scrape-section-item">
          <p>時刻の指定：</p>
          <input
            type="time"
            className="authed-scrape-section-item-value-2"
            onChange={(event) => {
              time = event.target.value;
            }}
          />
        </div>
        <button
          onClick={() => {
            handlescheduledScraping();
          }}
        >
          保存
        </button>
        <p className="authed-scrape-section-result">
          {isScrapeTimeChanged === null
            ? ""
            : isScrapeTimeChanged
            ? "設定しました（指定時刻にアプリが起動していない場合、また、プラン未加入の場合は実行されません）"
            : "システムエラーです。運営者にお問い合わせください。"}
        </p>
      </div>
    </>
  );
};

export default AuthedScrapeSection;
