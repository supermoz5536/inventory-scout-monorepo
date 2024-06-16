import React, { useState } from "react";
import "./App.css";
import { ButtonShared } from "component-shared";

function App() {
  // 開発用ハードコードのオブジェクト群
  const asinArray: Array<string> = ["B0C4SR7V7R", "B0C4SR7V7R", "B0C4SR7V7R"];
  const productURL: string =
    "https://m.media-amazon.com/images/I/7141kPbAYsL._AC_SL1200_.jpg";
  const amazonURL: string = "https://www.amazon.co.jp/dp/B0C4SR7V7R/ ";

  const productName: string =
    "コモライフ ビューナ うねりケアトリートメント くせ うねり ケア 酸熱 【日本製】";

  // 開発用の空関数
  const handleForDev = () => {};

  const gotoURL = (url: string) => {
    window.myAPI.openExternal(url);
  };

  return (
    <div className="App">
      <div className="globalList">
        <div className="asin-item">
          {/* 要素 ASIN */}
          <div className="square-space-asin">{<p>ASIN</p>}</div>

          {/* 要素2 3ボタン */}
          <div className="square-space-3button">
            <div className="square-space-3buttonp-elements">
              <p></p>
            </div>
          </div>

          {/* 要素3 画像 */}
          <div className="square-space-img">
            <p>画像</p>
          </div>

          {/* 要素4 商品名 */}
          <div className="square-space-name">
            <p>商品名</p>
          </div>

          {/* 要素5 Amazon在庫数 */}
          <div className="square-space-amazon-num">
            <p>Amazon</p>
          </div>
        </div>
        {asinArray.map((asin) => (
          <div className="asin-item">
            {/* 要素 ASIN */}
            <div className="square-space-asin">{<p>{asin}</p>}</div>

            {/* 要素2 3ボタン */}
            <div className="square-space-3button">
              <div className="square-space-3buttonp-elements">
                <button className="square-space-each-button">出品者一覧</button>
                <button
                  className="square-space-each-button"
                  onClick={() => {
                    gotoURL(amazonURL);
                  }}
                >
                  商品URL
                </button>
                <button className="square-space-each-button">在庫データ</button>
              </div>
            </div>

            {/* 要素3 画像 */}
            <div className="square-space-img">
              <img src={productURL} alt="" />
            </div>

            {/* 要素4 商品名 */}
            <div className="square-space-name">{<p>{productName}</p>}</div>

            {/* 要素5 Amazon在庫数 */}
            <div className="square-space-amazon-num">
              <p>0</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
