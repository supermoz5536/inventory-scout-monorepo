// import React, { useState } from "react";
import "./Manage.css";
// import { ButtonShared } from "component-shared";

function Manage() {
  // 開発用ハードコードのオブジェクト群
  const asinArray: Array<string> = [
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
    "B0C4SR7V7R",
  ];
  const productURL: string =
    "https://m.media-amazon.com/images/I/7141kPbAYsL._AC_SL1200_.jpg";
  const amazonURL: string = "https://www.amazon.co.jp/dp/B0C4SR7V7R/ ";

  const productName: string =
    "コモライフ ビューナ うねりケアトリーうねりケアトリーうねりケアトリーうねりケアトリートメント くせ うねり ケア 酸熱 【日本製】";

  // 開発用の空関数
  // const handleForDev = () => {};

  const gotoURL = (url: string) => {
    window.myAPI.openExternal(url);
  };

  return (
    <div className="App">
      {/* タブ部分 */}
      <div className="square-space-tab">
        <button className="square-space-tab-button">メイン画面</button>
        <button className="square-space-tab-button">ASIN管理</button>
      </div>
      <div className="body">
        <div className="left-column">
          <input type="text" className="input-asin" />
          <div className="left-column-down-container"></div>
        </div>

        <div className="right-column">
          {/* リスト全体 */}
          <div className="globalList">
            {/* リストヘッダー部分 */}
            <div className="asin-list-header">
              {/* 要素 ID */}
              <div className="square-space-amazon-num">ID</div>
              {/* 要素0 チェック */}
              <div className="square-space-amazon-num">削除</div>
              {/* 要素1 ASIN */}
              <div className="square-space-asin">{<p>ASIN</p>}</div>

              {/* 要素4 商品名 */}
              <div className="square-space-name">
                <p>商品名</p>
              </div>

              {/* 要素5 st-code */}
              <div className="square-space-st-code">
                <p>st_code</p>
              </div>

              {/* 要素6 lock-flag */}
              <div className="square-space-lock-flag">
                <p>lock-flag</p>
              </div>

              {/* 要素7 親ASIN */}
              <div className="square-space-asin">
                <p> 親ASIN</p>
              </div>
            </div>
            {/* リスト部分 */}
            {asinArray.map((asin, index) => (
              <div className="asin-list">
                {/* 要素 ID */}
                <div className="square-space-amazon-num">
                  <p>{index}</p>
                </div>
                {/* 要素0 チェック */}
                <div className="square-space-amazon-num">
                  <label>
                    <input type="checkbox" />
                  </label>
                </div>
                {/* 要素1 ASIN */}
                <div className="square-space-asin">{<p>{asin}</p>}</div>

                {/* 要素4 商品名 */}
                <div className="square-space-name">{<p>{productName}</p>}</div>

                {/* 要素5 st-code */}
                <div className="square-space-st-code">
                  <p>取得完了</p>
                </div>

                {/* 要素6 lock-flag */}
                <div className="square-space-amazon-num">
                  <p>0</p>
                </div>

                {/* 要素7 親ASIN */}
                <div className="square-space-asin">
                  <p>0</p>
                </div>
              </div>
            ))}
          </div>
          <div className="right-column-down-container"></div>
        </div>
      </div>
      <div className="body-bottom-container"></div>
    </div>
  );
}

export default Manage;
