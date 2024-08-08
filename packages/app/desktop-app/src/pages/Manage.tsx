import { useNavigate } from "react-router-dom";
import "./Manage.css";
import { useDispatch, useSelector } from "react-redux";

import {
  addAsin,
  removeAsin,
  switchRemoveCheck,
} from "../slices/asinDataListSlice";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { calculateRemainingTime } from "../util/calculateRemainingTime";
import { ManageMenu } from "../components/main-window/ManageMenu";
import { Footer } from "../components/main-window/Footer";
import { Box } from "@mui/material";
import { AsinDataTableManage } from "../components/main-window/AsinDataTableManage";

function Manage() {
  // グローバル変数のASINリストの値を取得
  const asinDataList = useSelector(
    (state: RootState) => state.asinDataList.value
  );
  const asinDataListRef = useRef(asinDataList);

  useEffect(() => {
    asinDataListRef.current = asinDataList;
  }, [asinDataList]);

  // グローバル変数のsystemStatusの値を取得
  const systemStatus = useSelector(
    (state: RootState) => state.systemStatus.value.systemStatus
  );

  const dispatch = useDispatch<AppDispatch>();

  // 入力フィールドの状態を管理するためのuseState
  const [inputAsin, setInputAsin] = useState<string>("");
  const [inputAsinCount, setInputAsinCount] = useState<number>(0);
  const [scrapeTimeLeft, setScrapeTimeLeft] = useState(0);
  const [isOpenConfirmDeleteDataDialog, setIsOpenConfirmDeleteDataDialog] =
    useState<boolean>(false);

  // インプット文字列情報を取得するための関数
  const handleInputChange = (event: any) => {
    setInputAsin(event.target.value);
  };

  // onPasteイベントをハンドルする関数
  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    setInputAsin((inputAsin) => inputAsin + pastedText);
  };

  // ボタンをクリックしたときにアクションをディスパッチする関数
  const handleAddAsin = async () => {
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
        amazonSellerNOP: null,
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
      // 状態変数の更新が完了するまで200ms待機
      await new Promise((resolve) => setTimeout(resolve, 200));
      // ストレージに最新のasinDataListを保存
      await window.myAPI.saveData(asinDataListRef.current);
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

  /// スクレイピング残り時間の表示を動的に変更します。
  useEffect(() => {
    const remainingTime = calculateRemainingTime(asinDataListRef.current);
    setScrapeTimeLeft(remainingTime);
  }, [asinDataList]);

  return (
    <div className="App">
      <ManageMenu
        inputAsinCount={inputAsinCount}
        inputAsin={inputAsin}
        setInputAsin={setInputAsin}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            marginRight: "30px",
            boxShadow: "7",
          }}
        >
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
            onPaste={handlePaste}
            rows={300}
            cols={10}
            placeholder={
              "追加ASINを改行で入力\n推奨：Excelから直接貼り付け\n\nB000000000\nB000000000\nB000000000\n    .\n    .\n    .\n    .\n    ."
            }
          />
        </Box>
        <AsinDataTableManage />
      </Box>
      <Footer scrapeTimeLeft={scrapeTimeLeft} />
    </div>
  );
}

export default Manage;
