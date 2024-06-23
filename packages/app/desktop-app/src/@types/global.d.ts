export declare global {
  interface Window {
    myAPI: {
      counter: (count: number) => number;
      openExternal: (url: string) => void | null;
      scrape: (asin: string) => void | null;
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
    fbasellerDatas: FbaSellerList;
  }

  interface FbaSellerList {
    fbaSellerData: FbaSellerData[];
  }

  interface FbaSellerData {
    date: string;
    stockCount;
  }
}
