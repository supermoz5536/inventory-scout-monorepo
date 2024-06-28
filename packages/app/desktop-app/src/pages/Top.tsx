import { useNavigate } from "react-router-dom";
import "./Top.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { removeAsin, switchRemoveCheck } from "../redux/asinDataListSlice";
import { useEffect, useState } from "react";

function Top() {
  // 開発用ハードコードのオブジェクト群
  const asinArray: Array<string> = ["B0C4SR7V7R", "B0C4SR7V7R", "B0C4SR7V7R"];
  const productURL: string =
    "https://m.media-amazon.com/images/I/41sEsXPy8QL._AC_SL1000_.jpg";
  const amazonURL: string = "https://www.amazon.co.jp/dp/B0C4SR7V7R/ ";

  const productName: string =
    "コモライフ ビューナ うねりケアトリートメント くせ うねり ケア 酸熱 【日本製】";

  const [asinDataListCount, setAsinDataListCount] = useState<number>(0);

  // dispatch: storeへのreducer起動のお知らせ役
  // dispatch関数を取得し、
  // その型をAppDispatchとして指定することで
  // アクションをディスパッチする際に型安全性が確保されます。
  const dispatch = useDispatch<AppDispatch>();

  const gotoURL = (url: string) => {
    window.myAPI.openExternal(url);
  };

  const navigate = useNavigate();

  // グローバル変数のASINリストの値を取得
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );

  const handleDeleteCheck = (id: string) => {
    dispatch(switchRemoveCheck(id));
  };

  useEffect(() => {
    const asinDataListCount = asinDataList.length;
    setAsinDataListCount(asinDataListCount);
  }, [asinDataList.length]);

  const handleRunScraping = async (asinDataList: AsinData[]) => {
    if (asinDataList.length > 0) {
      window.myAPI.runScraping(asinDataList);
    }
  };

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
            className="top-square-space-menu-container-left-update"
            onClick={() => handleRunScraping(asinDataList)}
          >
            更新
          </button>
          {/* 全選択チェック */}
          <input
            type="checkbox"
            className="top-square-space-menu-container-left-check"
          />
          {/* ASIN検索入力欄 */}
          <input
            type="text"
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
            type="text"
            className="top-square-space-menu-container-center-input"
          />
        </div>
        <div className="top-square-space-menu-container-right">
          <button
            className="top-square-space-menu-container-right-delete-button"
            onClick={() => {
              dispatch(removeAsin());
            }}
          >
            チェックしたASINを削除
          </button>
          <p className="top-square-space-menu-container-right-asin-num">
            登録ASIN数：{asinDataListCount}
          </p>
          <input
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
          {asinDataList.map((asinData) => (
            <div className="top-asin-list">
              {/* 要素0 チェック */}
              <div className="top-square-space-asin-delete">
                <label>
                  <input
                    type="checkbox"
                    onChange={() => {
                      handleDeleteCheck(asinData.id);
                    }}
                    checked={asinData.deleteCheck}
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
                  <button className="top-square-space-each-button">
                    出品者一覧
                  </button>
                  <button
                    className="top-square-space-each-button"
                    onClick={() => {
                      gotoURL(amazonURL);
                    }}
                  >
                    商品URL
                  </button>
                  <button className="top-square-space-each-button">
                    在庫データ
                  </button>
                </div>
              </div>

              {/* 要素3 画像 */}
              <div className="top-square-space-img">
                <img src={asinData.imageUrl} alt="" />
              </div>

              {/* 要素4 商品名 */}
              <div className="top-square-space-name">
                {<p>{asinData.name}</p>}
              </div>

              {/* 要素5 Amazon在庫数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.amazonStock == -1 ? "" : asinData.amazonStock}</p>
              </div>

              {/* 要素6 FBAセラー数 */}
              <div className="top-square-space-amazon-num">
                <p>
                  {asinData.fbaSellerNOP == -1 ? "" : asinData.fbaSellerNOP}
                </p>
              </div>

              {/* 要素7 合計在庫数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.totalStock == -1 ? "" : asinData.totalStock}</p>
              </div>

              {/* 要素8 カート価格 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.cartPrice == -1 ? "" : asinData.cartPrice}</p>
              </div>

              {/* 要素9 本日の減少数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.decrease1 == -1 ? "" : asinData.decrease1}</p>
              </div>

              {/* 要素10 週間の減少数 */}
              <div className="top-square-space-amazon-num">
                <p>{asinData.decrease2 == -1 ? "" : asinData.decrease2}</p>
              </div>

              {/* 要素11 最新取得 */}
              <div className="top-square-space-update-latest">
                <p>{asinData.fetchLatestDate}</p>
                <p></p>
              </div>

              {/* 要素12 取得状況 */}
              <div className="top-square-space-update-state">
                <p>{asinData.fetchCurrentStatus}</p>
              </div>

              {/* 要素13 親ASIN */}
              <div className="top-square-space-asin">
                {<p>{asinData.asinParent}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Top;
