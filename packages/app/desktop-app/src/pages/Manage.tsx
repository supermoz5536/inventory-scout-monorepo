import { useNavigate } from "react-router-dom";
import "./Manage.css";

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

  const navigate = useNavigate();

  return (
    <div className="App">
      {/* タブ部分 */}
      <div className="manage-square-space-tab">
        <button
          className="manage-square-space-tab-button"
          onClick={() => {
            // App.tsxでマッピングしたURLパスを指定
            navigate("/Top");
          }}
        >
          メイン画面
        </button>
        <button
          className="manage-square-space-tab-button"
          onClick={() => {
            navigate("/Manage");
          }}
        >
          ASIN管理
        </button>
      </div>
      <div className="manage-body">
        {/* 左Columnエリア */}
        <div className="manage-left-column">
          <input type="text" className="manage-input-asin" />
          {/* 下部コンテナ */}
          <div className="manage-left-column-down-container">
            <p className="manage-add-asin-count">300</p>
            <button className="manage-add-asin-button">登録</button>
          </div>
        </div>
        {/* 右Columnエリア */}
        <div className="manage-right-column">
          {/* リスト全体 */}
          <div className="manage-globalList">
            {/* リストヘッダー部分 */}
            <div className="manage-asin-list-header">
              {/* 要素 ID */}
              <div className="manage-square-space-amazon-num">ID</div>
              {/* 要素0 チェック */}
              <div className="manage-square-space-amazon-num">削除</div>
              {/* 要素1 ASIN */}
              <div className="manage-square-space-asin">{<p>ASIN</p>}</div>

              {/* 要素4 商品名 */}
              <div className="manage-square-space-name">
                <p>商品名</p>
              </div>

              {/* 要素5 st-code */}
              <div className="manage-square-space-st-code">
                <p>st_code</p>
              </div>

              {/* 要素6 lock-flag */}
              <div className="manage-square-space-lock-flag">
                <p>lock-flag</p>
              </div>

              {/* 要素7 親ASIN */}
              <div className="manage-square-space-asin">
                <p> 親ASIN</p>
              </div>
            </div>

            {/* リスト部分 */}
            <div className="manage-asinArray-map-wrapper-manage-css">
              {asinArray.map((asin, index) => (
                <div className="manage-asin-list" key={index}>
                  {/* 要素 ID */}
                  <div className="manage-square-space-amazon-num">
                    <p>{index}</p>
                  </div>
                  {/* 要素0 チェック */}
                  <div className="manage-square-space-amazon-num">
                    <label>
                      <input type="checkbox" />
                    </label>
                  </div>
                  {/* 要素1 ASIN */}
                  <div className="manage-square-space-asin">
                    {<p>{asin}</p>}
                  </div>

                  {/* 要素4 商品名 */}
                  <div className="manage-square-space-name">
                    {<p>{productName}</p>}
                  </div>

                  {/* 要素5 st-code */}
                  <div className="manage-square-space-st-code">
                    <p>取得完了</p>
                  </div>

                  {/* 要素6 lock-flag */}
                  <div className="manage-square-space-lock-flag">
                    <p>0</p>
                  </div>

                  {/* 要素7 親ASIN */}
                  <div className="manage-square-space-asin">
                    <p>B0C4SR7V7R</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 下部コンテナ */}
          <div className="manage-right-column-down-container">
            <button className="manage-delete-selected-asin-button">
              選択したASINを削除
            </button>
            <button className="manage-delete-no-fba-asin-button">
              FBAセラーのいないASINを削除
            </button>
            <button className="manage-delete-no-protected-asin-button">
              保護されたASIN以外を削除
            </button>
          </div>
        </div>
      </div>
      <div className="manage-bottom-container">
        <p>取得中・・・</p>
      </div>
    </div>
  );
}

export default Manage;
