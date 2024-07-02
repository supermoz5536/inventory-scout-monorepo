import { useNavigate } from "react-router-dom";
import "./Manage.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store"; // 型をインポート
import {
  addAsin,
  removeAsin,
  switchRemoveCheck,
} from "../redux/asinDataListSlice";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function Manage() {
  // グローバル変数のASINリストの値を取得
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );
  const asinDataListRef = useRef(asinDataList);

  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  // 入力フィールドの状態を管理するためのuseState
  const [inputAsin, setInputAsin] = useState<string>("");
  const [inputAsinCount, setInputAsinCount] = useState<number>(0);

  // インプット文字列情報を取得するための関数
  const handleInputChange = (event: any) => {
    setInputAsin(event.target.value);
  };

  // タブ切り替えのフック
  const navigate = useNavigate();

  // dispatch: storeへのreducer起動のお知らせ役
  // dispatch関数を取得し、
  // その型をAppDispatchとして指定することで
  // アクションをディスパッチする際に型安全性が確保されます。
  const dispatch = useDispatch<AppDispatch>();

  // ボタンをクリックしたときにアクションをディスパッチする関数
  const handleAddAsin = () => {
    // まず、入力されたASINコードが
    // 空でないか（または空白だけでないか）を確認します。
    if (inputAsin.trim()) {
      const inputAsinLines = inputAsin
        // 改行で文字列を各ine要素にスプリット
        // /：正規表現リテラルの開始と終了を示します。
        // []：中括弧内の任意の一文字にマッチします（文字クラス）。
        // \r：古いMacOSでの改行文字にマッチ
        //\n：Unix/Linuxおよび新しいMacOSシステムでの改行文字にマッチ
        //\s：空白文字（スペース、タブ、改行、フォームフィードなど）にマッチします。
        //+：直前の文字または文字クラスが1回以上繰り返されることにマッチします。
        .split(/[\r\n\s]+/)
        // 各lineに空白のトリム処理を実行
        .map((line) => line.trim())
        // 各lineに対して、空白でなければ
        // そのlineを新たな配列の要素に加える処理を実行
        .filter((line) => line !== "");

      // ASINの配列をAsinData型のオブジェクトの配列に変換
      // (asin) => ({ asin }): この書き方は
      //「mapメソッドのイテレートな処理による各要素の文字列の値」を格納した
      //「変数asin」を値に持つ、
      //「asin」というプロパティ名を持ったオブジェクトを作成します。
      // つまり、sring[]型の asinLines の各要素を
      // mapメソッドで1つ1つ以下のオブジェクトにキャストしています。
      // オブジェクト名: asinDataArray
      // プロパティ名: asin
      // プロパティの値: 各map処理で変数asin代入されるASIN番号
      const inputAsinDatas: AsinData[] = inputAsinLines.map((asin) => ({
        id: uuidv4(),
        isDeleteCheck: false,
        asin,
        imageURL: "",
        name: "",
        amazonStock: null,
        fbaSellerNOP: null,
        totalStock: null,
        cartPrice: "",
        decrease1: -1,
        decrease2: -1,
        fetchLatestDate: "",
        fetchLatestTime: "",
        asinParent: "",
        fbaSellerDatas: [],
        isScraping: null,
      }));

      // 入力したASINリストにfilterメソッドを適用して
      // 各イテレート処理において、asinListの各要素と一致するかをイテレートに照合
      // 照合にはsomeメソッドを使う。
      // 一致した場合(True)は、重複してる必要のないASINなので
      // 論理否定演算子！で真偽値の結果を反転させて
      // ASINが重複してないのイテレート処理の場合のみ要素を返す操作を行う
      const inputAsinDatasFilterd: AsinData[] = inputAsinDatas.filter(
        (inputAsinData: AsinData) =>
          !asinDataList.some(
            (asinData: AsinData) => asinData.asin === inputAsinData.asin
          )
      );

      // dispatch関数を使って、
      // addAsinアクションをストアに送信します。
      // このアクションは、入力されたASINコードを
      // ストアに追加するためのものです。
      // addAsin([{ asin: inputAsin }])で、
      // ASINコードを含むオブジェクトの配列を
      // アクションとしてディスパッチしています。
      dispatch(addAsin(inputAsinDatasFilterd));
      setInputAsin(""); // 入力フィールドをクリア
    }
  };

  const handleDeleteCheck = (id: string) => {
    dispatch(switchRemoveCheck(id));
  };

  useEffect(() => {
    const inputAsinLinesLength = inputAsin
      .split(/[\r\n\s]+/)
      .map((line) => line.trim())
      .filter((line) => line !== "").length;
    setInputAsinCount(inputAsinLinesLength);
  }, [inputAsin]);

  const handleRemoveAsin = async () => {
    dispatch(removeAsin());
    // 状態変数の更新が完了するまで200ms待機
    await new Promise((resolve) => setTimeout(resolve, 200));
    // ストレージに最新のasinDataListを保存
    await window.myAPI.saveData(asinDataListRef.current);
  };

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
          <textarea
            className="manage-input-asin"
            value={inputAsin} /* valueの値をinputAsinに紐づけています。*/
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                // デフォルトのブラウザの動作による
                // Enterキーの動作(改行)を防ぎます。
                event.preventDefault();
                handleAddAsin();
              }
            }}
            rows={300}
            cols={10}
            placeholder={
              "追加ASINを改行で入力\n推奨：Excelから直接貼り付け\n\nB000000000\nB000000000\nB000000000\n    .\n    .\n    .\n    .\n    ."
            }
          />
          {/* 下部コンテナ */}
          <div className="manage-left-column-down-container">
            <p className="manage-add-asin-count">{inputAsinCount}</p>
            <button className="manage-add-asin-button" onClick={handleAddAsin}>
              登録
            </button>
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
              {asinDataList.map((asinData, index) => (
                <div className="manage-asin-list" key={index}>
                  {/* 要素 ID */}
                  <div className="manage-square-space-amazon-num">
                    <p>{index + 1}</p>
                  </div>
                  {/* 要素0 チェック */}
                  <div className="manage-square-space-amazon-num">
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
                  <div className="manage-square-space-asin">
                    {<p>{asinData.asin}</p>}
                  </div>

                  {/* 要素4 商品名 */}
                  <div className="manage-square-space-name">
                    {<p>{asinData.name}</p>}
                  </div>

                  {/* 要素5 st-code */}
                  <div className="manage-square-space-st-code">
                    <p>
                      {" "}
                      {asinData.isScraping === null
                        ? ""
                        : asinData.isScraping === true
                        ? "取得中"
                        : "取得完了"}
                    </p>
                  </div>

                  {/* 要素6 lock-flag */}
                  <div className="manage-square-space-lock-flag">
                    <p></p>
                  </div>

                  {/* 要素7 親ASIN */}
                  <div className="manage-square-space-asin">
                    <p>{asinData.asinParent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 下部コンテナ */}
          <div className="manage-right-column-down-container">
            <button
              className="manage-delete-selected-asin-button"
              onClick={() => {
                handleRemoveAsin();
              }}
            >
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
