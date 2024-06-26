declare global {
  interface Window {
    myAPI: {
      counter: (count: number) => number;
      openExternal: (url: string) => void | null;
      runScraping: (asinDataList: AsinData[]) => void;
      scrapingResult: (
        callback: (event: Electron.IpcRendererEvent, data: AsinData) => void
      ) => void;
    };
  }

  // initialStateの型定義
  // ASINState型のオブジェクトが
  // ASINData型のvalueプロパティを
  // 持つことを定義している。
  interface AsinDataListState {
    value: AsinData[];
  }

  // ASINData型のオブジェクトが
  // string型のasinプロパティを
  // 持つことを定義している。
  interface AsinData {
    id: string;
    deleteCheck: boolean;
    asin: string;
    imageUrl: string;
    name: string;
    amazonStock: number;
    fbaSellerNOP: number;
    totalStock: number;
    cartPrice: number;
    decrease1: number;
    decrease2: number;
    fetchLatestDate: string;
    fetchCurrentStatus: string;
    asinParent: string;
    fbaSellerDatas: FbaSellerData[];
  }

  interface FbaSellerData {
    sellerId: number;
    sellerName: string;
    stockCount: number;
    updateDate: string;
  }
}

/// key が日付 value が在庫数の型定義です。
interface StockCount {
  [date: string]: number;
}

// tsの構文では
// declare global を使う場合は、
// ファイルの最後に空の export {} を追加することで、
// エクスポート可能なモジュールとして扱えます。

// これにより、レンダラープロセスのグローバルな型定義を
// tsの構文で正しく適用しつつ、
// ファイルをモジュールとしてメインプロセスにインポートできます。
export {};
