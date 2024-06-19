import { useNavigate } from "react-router-dom";
import "./Top.css";

function Top() {
  // 開発用ハードコードのオブジェクト群
  const asinArray: Array<string> = ["B0C4SR7V7R", "B0C4SR7V7R", "B0C4SR7V7R"];
  const productURL: string =
    "https://m.media-amazon.com/images/I/7141kPbAYsL._AC_SL1200_.jpg";
  const amazonURL: string = "https://www.amazon.co.jp/dp/B0C4SR7V7R/ ";

  const productName: string =
    "コモライフ ビューナ うねりケアトリートメント くせ うねり ケア 酸熱 【日本製】";

  // 開発用の空関数
  // const handleForDev = () => {};

  const gotoURL = (url: string) => {
    window.myAPI.openExternal(url);
  };

  const navigate = useNavigate();

  return (
    <div className="App">
      {/* タブ部分 */}
      <div className="square-space-tab">
        <button
          className="square-space-tab-button"
          onClick={() => {
            // App.tsxでマッピングしたURLパスを指定
            navigate("/Top");
          }}
        >
          メイン画面
        </button>
        <button
          className="square-space-tab-button"
          onClick={() => {
            navigate("/Manage");
          }}
        >
          ASIN管理
        </button>
      </div>

      {/* メニュー部分 */}
      <div className="square-space-menu">
        <div className="square-space-menu-container-left">
          <input
            type="checkbox"
            className="square-space-menu-container-left-check"
          />
          <input
            type="text"
            className="square-space-menu-container-left-input"
          />
        </div>

        <div className="square-space-menu-container-center">
          <p className="square-space-menu-container-center-decrease1">
            減少１：最新取得分の減少数
          </p>
          <p className="square-space-menu-container-center-decrease2">
            減少２：直近１週間の減少数
          </p>
          <input
            type="text"
            className="square-space-menu-container-center-input"
          />
        </div>
        <div className="square-space-menu-container-right">
          <button className="square-space-menu-container-right-delete-button">
            チェックしたASINを削除
          </button>
          <p className="square-space-menu-container-right-asin-num">
            登録ASIN数：300
          </p>
          <input
            type="text"
            className="square-space-menu-container-right-input"
          />
        </div>
      </div>

      {/* リスト全体 */}
      <div className="globalList">
        {/* リストヘッダー部分 */}
        <div className="asin-list-header">
          {/* 要素0 チェック */}
          <div className="square-space-amazon-num">削除</div>
          {/* 要素1 ASIN */}
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
            <p>AMAZON</p>
          </div>

          {/* 要素6 FBAセラー数 */}
          <div className="square-space-amazon-num">
            <p>FBA数</p>
          </div>

          {/* 要素7 合計在庫 */}
          <div className="square-space-amazon-num">
            <p>合計在庫</p>
          </div>

          {/* 要素8 カート価格 */}
          <div className="square-space-amazon-num">
            <p>カート価格</p>
          </div>

          {/* 要素9 本日の減少数 */}
          <div className="square-space-amazon-num">
            <p>減少１</p>
          </div>

          {/* 要素10 週間の減少数 */}
          <div className="square-space-amazon-num">
            <p>減少２</p>
          </div>

          {/* 要素11 最新取得 */}
          <div className="square-space-update-latest">
            <p>最新取得</p>
          </div>

          {/* 要素12 取得状況 */}
          <div className="square-space-update-state">
            <p>取得状況</p>
          </div>

          {/* 要素13 親ASIN */}
          <div className="square-space-asin">{<p>親ASIN</p>}</div>
        </div>

        <div className="asinArray-map-wrapper-top-css">
          {/* リスト部分 */}
          {asinArray.map((asin) => (
            <div className="asin-list">
              {/* 要素0 チェック */}
              <div className="square-space-amazon-num">
                <label>
                  <input type="checkbox" />
                </label>
              </div>

              {/* 要素1 ASIN */}
              <div className="square-space-asin">{<p>{asin}</p>}</div>

              {/* 要素2 3ボタン */}
              <div className="square-space-3button">
                <div className="square-space-3buttonp-elements">
                  <button className="square-space-each-button">
                    出品者一覧
                  </button>
                  <button
                    className="square-space-each-button"
                    onClick={() => {
                      gotoURL(amazonURL);
                    }}
                  >
                    商品URL
                  </button>
                  <button className="square-space-each-button">
                    在庫データ
                  </button>
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

              {/* 要素6 FBAセラー数 */}
              <div className="square-space-amazon-num">
                <p>0</p>
              </div>

              {/* 要素7 合計在庫数 */}
              <div className="square-space-amazon-num">
                <p>0</p>
              </div>

              {/* 要素8 カート価格 */}
              <div className="square-space-amazon-num">
                <p>0</p>
              </div>

              {/* 要素9 本日の減少数 */}
              <div className="square-space-amazon-num">
                <p>0</p>
              </div>

              {/* 要素10 週間の減少数 */}
              <div className="square-space-amazon-num">
                <p>0</p>
              </div>

              {/* 要素11 最新取得 */}
              <div className="square-space-update-latest">
                <p>24/04/25</p>
                <p>15:34</p>
              </div>

              {/* 要素12 取得状況 */}
              <div className="square-space-update-state">
                <p>取得完了</p>
              </div>

              {/* 要素13 親ASIN */}
              <div className="square-space-asin">{<p>B0C4SR7V7R</p>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Top;
