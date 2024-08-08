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

export const ManageMenu = ({
  inputAsinCount,
  inputAsin,
  setInputAsin,
}: {
  inputAsinCount: number;
  inputAsin: string;
  setInputAsin: any;
}) => {
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
          minWidth: "190px",
          display: "flex",
          position: "relative",
        }}
      >
        <Button
          variant="contained"
          onClick={handleAddAsin}
          sx={{
            height: "30px",
            width: "100px",
            fontWeight: "bold",
            position: "absolute",
            top: "19%",
            left: "7.5%",
            /* transform: translate(-50%, -50%); */
          }}
        >
          ASIN追加
        </Button>
        <Box
          sx={{
            position: "absolute",
            top: "29%",
            left: "75%",
            fontSize: "16px",
          }}
        >
          {inputAsinCount}
        </Box>
      </Box>

      {/* メニューの中央コンテナ */}
      <Box
        sx={{
          width: "100%",
          borderLeft: "0.5px solid #c0c0c0",
          display: "flex",
          position: "relative",
        }}
      >
        <Button
          variant="contained"
          onClick={() => {
            handleRemoveAsin();
          }}
          sx={{
            height: "30px",
            width: "170px",
            fontWeight: "bold",
            position: "absolute",
            top: "21%",
            left: "2.3%",
            fontSize: "14px",
          }}
        >
          選択したASINを削除
        </Button>
        <Button
          variant="contained"
          sx={{
            height: "30px",
            width: "320px",
            fontWeight: "bold",
            position: "absolute",
            top: "21%",
            left: "17%",
            fontSize: "14px",
          }}
        >
          Amazon本体の出品してるASINを全て削除
        </Button>
        <Button
          variant="contained"
          sx={{
            height: "30px",
            width: "280px",
            fontWeight: "bold",
            position: "absolute",
            top: "21%",
            left: "42.5%",
            fontSize: "14px",
          }}
        >
          FBAセラーのいないASINを全て削除
        </Button>

        <Button
          variant="contained"
          sx={{
            height: "30px",
            width: "250px",
            fontWeight: "bold",
            position: "absolute",
            top: "21%",
            left: "79.5%",
            fontSize: "14px",
          }}
        >
          選択したASIN "以外" を全て削除
        </Button>
      </Box>

      {/* メニューの右コンテナ */}
    </Box>
  );
};
