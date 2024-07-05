import React from "react";
import "./AuthedScrapeSection.css";

const AuthedScrapeSection = () => {
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
            onChange={() => {}}
          />
        </div>
        <div className="authed-scrape-section-item">
          <p>時刻の指定：</p>
          <input className="authed-scrape-section-item-value-2" />
        </div>
        <button>保存</button>
      </div>
    </>
  );
};

export default AuthedScrapeSection;
