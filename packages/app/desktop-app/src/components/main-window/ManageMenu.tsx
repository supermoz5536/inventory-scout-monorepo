import { Box, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  addAsin,
  removeAsin,
  switchRemoveCheck,
} from "../../slices/asinDataListSlice";
import { calculateRemainingTime } from "../../util/calculateRemainingTime";

export const ManageMenu = ({ inputAsinCount }: { inputAsinCount: number }) => {
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

  // 入力フィールドの状態を管理するためのuseState
  const [inputAsin, setInputAsin] = useState<string>("");

  // インプット文字列情報を取得するための関数
  const handleInputChange = (event: any) => {
    setInputAsin(event.target.value);
  };

  // dispatch: storeへのreducer起動のお知らせ役
  // dispatch関数を取得し、
  // その型をAppDispatchとして指定することで
  // アクションをディスパッチする際に型安全性が確保されます。
  const dispatch = useDispatch<AppDispatch>();

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

  const handleRemoveAsin = async () => {
    dispatch(removeAsin());
    // 状態変数の更新が完了するまで200ms待機
    await new Promise((resolve) => setTimeout(resolve, 200));
    // ストレージに最新のasinDataListを保存
    await window.myAPI.saveData(asinDataListRef.current);
  };

  const [scrapeTimeLeft, setScrapeTimeLeft] = useState(0);

  /// スクレイピング残り時間の表示を動的に変更します。
  useEffect(() => {
    const remainingTime = calculateRemainingTime(asinDataListRef.current);
    setScrapeTimeLeft(remainingTime);
  }, [asinDataList]);

  return (
    // menuのグローバルBox
    <Box
      component={"div"}
      sx={{
        width: "100%",
        height: "50px",
        marginTop: "0px",
        marginBottom: "17.5px",
        boxShadow: "2",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "row",
        justifyContent: "start",
        flexShrink:
          "0" /* フレックスコンテナ内の要素が親スペースよりも大きい場合に、要素の縮小を防止。*/,
      }}
    >
      {/* メニューの左コンテナ */}
      <Box
        sx={{
          width: "190px",
          display: "flex",
          position: "relative",
        }}
      >
        <button className="manage-add-asin-button" onClick={handleAddAsin}>
          登録
        </button>
        <p className="manage-add-asin-count">{inputAsinCount}</p>
      </Box>

      {/* メニューの中央コンテナ */}
      <Box
        sx={{
          width: "832px",
          borderLeft: "0.5px solid #c0c0c0",
          borderRight: "0.5px solid #c0c0c0",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          className="manage-delete-selected-asin-button"
          onClick={() => {
            handleRemoveAsin();
          }}
        >
          選択したASINを削除
        </button>
        <button
        // className="manage-delete-no-fba-asin-button"
        >
          FBAセラーのいないASINを全て削除
        </button>
        <button>チェックしたASIN "以外" を全て削除</button>
        <button>Amazon本体の出品してるASINを全て削除</button>
      </Box>

      {/* メニューの右コンテナ */}
      <Box
        sx={{
          width: "220px",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
        }}
      ></Box>
    </Box>
  );
};
