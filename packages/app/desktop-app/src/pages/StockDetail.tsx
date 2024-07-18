import React, { useEffect, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import Calender from "../components/stock-detail/Calender";
import Table from "../components/stock-detail/Table";
import { AppBar, Toolbar, Typography } from "@mui/material";
import Chart from "../components/stock-detail/Chart";
import DecreaseMetrics from "../components/stock-detail/DecreaseMetrics";

const StockDetail = () => {
  // コンポーネントマウント時に
  // 表示するasinDataをメインプロセスから取得
  const [targetAsinData, setTargetAsinData] = useState<AsinData>({
    id: "",
    isDeleteCheck: false,
    asin: "",
    imageURL: "",
    name: "",
    amazonSellerNOP: 0,
    fbaSellerNOP: 0,
    totalStock: 0,
    cartPrice: "",
    decrease1: 0,
    decrease2: 0,
    fetchLatestDate: "",
    fetchLatestTime: "",
    asinParent: "",
    fbaSellerDatas: [],
    isScraping: false,
  });

  useEffect(() => {
    const handleAsinData = (event: any, asinData: AsinData) => {
      setTargetAsinData(asinData);
    };
    window.myAPI.receiveAsinData(handleAsinData);
    return () => {
      window.myAPI.disposeListener("receive-asin-data", handleAsinData);
    };
  }, []);

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
  const [tableColumnHeader, setTableColumnHeader] = useState(["セラー"]);

  // ② Tableコンポーネントbody部分の
  // 各セラー（行）ごとの
  // { 日付（キー）: 在庫数(値) }
  // の要素を格納するオブジェクト
  // 横列の役割
  const [tableData, setTableData] = useState<any>();

  // Calenderコンポーネントで操作された
  // dataRangeの変更を取得するたびに
  // ①② の更新処理を行います。
  useEffect(() => {
    // ① 変更された日付範囲に、列見出しを更新
    const startDate = resetTime(new Date(dateRange[0]));
    const endDate = resetTime(new Date(dateRange[1]));

    const newColumnHeader = [""];
    let currentDate = new Date(startDate); // startDateのコピーを作成

    while (currentDate <= endDate) {
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      newColumnHeader.push(formattedDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setTableColumnHeader(newColumnHeader);
    // ② 変更された日付範囲に、Table > body の要素を更新
    // 配列の初期値は
    // ["セラー名"] で、その後に、変更された日付範囲の
    // { 日付(string): 在庫数(number) }
    // のオブジェクトを、スプレット関数で連結させればいい。
    // 配列には、セラーごとのオブジェクトを格納する必要があるから
    // asinDataのセラーの値が格納されてるプロパティでmap処理すればいい

    // console.log("■ 3 targetAsinData =", targetAsinData);
    const newData = targetAsinData.fbaSellerDatas.map(
      (fbaSellerData: FbaSellerData) => {
        // イテレートな処理で各rowのdataオブジェクトを作成する
        // まず、セラー名のみのオブジェクトを作成
        const sellerData: { "": string; [key: string]: number | string } = {
          "": fbaSellerData.sellerName,
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
          const date: Date = resetTime(parseISO(dateKeys[0]));

          if (date >= startDate && date <= endDate) {
            const formattedDate: string = format(date, "yyyy-MM-dd");
            // ブラケット記法（[ ]（ブラケット）を使って
            // sellerDataオブジェクトのプロパティに
            // [プロパティ名(キー)]を作成し、その値に
            // eachDataの該当のキーのオブジェクトの値（在庫数）を設定
            sellerData[formattedDate] = eachData[formattedDate];
          }
        });
        return sellerData;
      }
    );
    setTableData(newData);
  }, [targetAsinData, dateRange]);

  // Chartコンポーネントに渡す値の状態管理設定
  const [chartDataList, setChartDataList] = useState<
    { date: string; [key: string]: number | string }[]
  >([
    {
      date: "10/01",
    },
  ]);

  // Chartコンポーネントに渡すデータの生成関数です
  useEffect(() => {
    // ① 変更された日付範囲において、各日のオブジェクトを処理
    const startDate = resetTime(new Date(dateRange[0]));
    const endDate = resetTime(new Date(dateRange[1]));

    let newChartDataList: any[] = [];
    let currentDate = new Date(startDate); // startDateのコピーを作成

    // 日付のキーと値だけ設定されてる
    // チャートの各グリッドに割り当てるデータを用意
    while (currentDate <= endDate) {
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      let newEachDayData: any = { date: formattedDate };

      // 必要な情報は
      // 各日付(currentDate)に対して
      // 各セラーのstockCountDatas配列内の要素で
      // currentDateと一致するキーを持つオブジェクトを見つけ
      // セラー名をキーとするプロパティを追加して、そのキーの値(在庫数)を代入
      targetAsinData.fbaSellerDatas.forEach((fbaSellerData) => {
        return fbaSellerData.stockCountDatas.forEach(
          (stockCountData: StockCountData) => {
            if (Object.keys(stockCountData)[0] === formattedDate) {
              newEachDayData[fbaSellerData.sellerName] =
                stockCountData[formattedDate];
            }
          }
        );
      });

      // 最後にASIN全体の在庫分のチャートライン用データを用意する
      // dateキーを除く全てのキーを取得し
      const keysWithoutDate: string[] = Object.keys(newEachDayData).filter(
        (key) => key !== "date"
      );

      // それぞれの値を合計する
      const totalStock: number | null = keysWithoutDate.reduce((acc, key) => {
        return acc + newEachDayData[key];
      }, null);

      // 同じくnewChartDataの新規プロパティ("在庫合計")に値を代入する
      newEachDayData = { FBA全体在庫: totalStock, ...newEachDayData };

      // 該当の日付の各セラーの販売数を格納したオブジェクトを
      // Chartコンポーネントに渡す配列に追加
      newChartDataList.push(newEachDayData);

      // 次の日付の処理へ
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setChartDataList(newChartDataList);
  }, [targetAsinData, dateRange]);

  // startDateとendDateの時間部分をリセットする関数
  const resetTime = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date;
  };

  return (
    <>
      {/* static: AppBar が通常の文書フローに従って配置されます。
       スクロールしても固定されず、他のコンテンツと一緒にスクロールされます。 */}
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            在庫データ
          </Typography>
        </Toolbar>
      </AppBar>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "start",
        }}
      >
        <DecreaseMetrics />
        <Calender onChange={setDateRange} />
      </div>
      <Table columnHeader={tableColumnHeader} data={tableData} />
      <Chart data={chartDataList} />
    </>
  );
};

export default StockDetail;
