export declare global {
  interface Window {
    myAPI: {
      counter: (count: number) => number;
      openExternal: (url: string) => void | null;
    };
  }
  // ASINData型のオブジェクトが
  // string型のasinプロパティを
  // 持つことを定義している。
  interface AsinData {
    asin: string;
    id: string;
    deleteCheck: boolean;
  }

  // initialStateの型定義
  // ASINState型のオブジェクトが
  // ASINData型のvalueプロパティを
  // 持つことを定義している。
  interface AsinDataListState {
    value: AsinData[];
  }
}
