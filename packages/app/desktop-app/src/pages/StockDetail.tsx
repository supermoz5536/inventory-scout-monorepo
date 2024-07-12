import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import Calender from "../components/stock-detail/Calender";
import { Table } from "../components/stock-detail/Table";

const StockDetail = () => {
  //

  // コンポーネントマウント時に
  // 表示するasinDataをメインプロセスから取得
  const [targetAsinData, setTargetAsinData] = useState<AsinData>();
  useEffect(() => {
    window.myAPI.receiveAsinData((asinData: AsinData) => {
      setTargetAsinData(asinData);
    });
  }, [targetAsinData]);

  // 手動で日付の変更操作があった場合に
  // 親コンポーネントの日付範囲を格納した変数を
  // CalenderコンポーネントからsetDateRageで変更する
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);

  // ① 縦(日付)
  // ② 横(セラー)
  // 上記の交わる条件で
  // Tableの該当のセルに在庫数を描画

  // ① 列見出しの各セルの見出し文を格納する配列
  // 縦列の役割
  const [columnHeader, setColumnHeader] = useState(["セラー"]);

  // ② Tableコンポーネントbody部分の
  // 各セラー（行）ごとの
  // { 日付（キー）: 在庫数(値) }
  // の要素を格納するオブジェクト
  // 横列の役割
  const [data, setData] = useState<any>();

  // Calenderコンポーネントで操作された
  // dataRangeの変更を取得するたびに
  // ①② の更新処理を行います。
  useEffect(() => {
    // ① 変更された日付範囲に、列見出しを更新
    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const newColumnHeader = ["Seller"];

    let currentDate = startDate;
    while (currentDate <= endDate) {
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      newColumnHeader.push(formattedDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setColumnHeader(newColumnHeader);

    // ② 変更された日付範囲に、Table > body の要素を更新
    // 配列の初期値は
    // ["セラー名"] で、その後に、変更された日付範囲の
    // { 日付(string): 在庫数(number) }
    // のオブジェクトを、スプレット関数で連結させればいい。
    // 配列には、セラーごとのオブジェクトを格納する必要があるから
    // asinDataのセラーの値が格納されてるプロパティでmap処理すればいい
    const newData = targetAsinData?.fbaSellerDatas.map((fbaSellerData) => {
      // イテレートな処理で各rowのdataオブジェクトを作成する
      // まず、セラー名のみのオブジェクトを作成
      const sellerData: { Seller: string; [key: string]: number | string } = {
        Seller: fbaSellerData.sellerName,
      };

      // このオブジェクトに、そのセラーデータが保有してる
      // 変更された日付の範囲内の
      // 日付と在庫数のデータオブジェクトを追加していく

      // 判定方法は
      // stockCountDatas格納されてるオブジェクトの
      // キーの値が、変更された日付の範囲内、つまり
      // startDataとendDataの間に含まれていること

      // 含まれている場合、sellerDataに新たなプロパティとして追加
      fbaSellerData.stockCountDatas.forEach((eachData: StockCountData) => {
        // StockCountData型objのキーは
        // "yyyy-MM-dd"形式のstring型なので
        // 比較可能な形式のDate型に変換
        const dateKeys = Object.keys(eachData);
        const date: Date = parseISO(dateKeys[0]);

        if (startDate <= date && date >= endDate) {
          const formattedDate: string = format(date, "yyyy-MM-dd");

          // ブラケット記法（[ ]（ブラケット）を使って
          // sellerDataオブジェクトのプロパティに
          // [プロパティ名(キー)]を作成し、その値に
          // eachDataの該当のキーのオブジェクトの値（在庫数）を設定
          sellerData[formattedDate] = eachData[formattedDate];
        }
      });
    });

    setData(newData);
  }, [dateRange]);

  return (
    <>
      <Calender onChange={setDateRange} />
      <Table columnHeader={columnHeader} data={data} />
    </>
  );
};

export default StockDetail;
