import { store } from "../redux/store";

declare global {
  interface Window {
    myAPI: {
      counter: (count: number) => number;
      openExternal: (url: string) => void | null;
      runScraping: (asinDataList: AsinData[]) => void;
      stopScraping: () => void;
      stopScheduledScraping: () => void;
      scrapingResult: (
        callback: (
          event: Electron.IpcRendererEvent,
          data: AsinData,
          isEnd: boolean
        ) => void
      ) => void;
      saveData: (asinDataList: AsinData[]) => Promise<void>;
      loadData: () => Promise<AsinData[]>;
      saveUser: (user: User) => Promise<void>;
      openLoginPrompt: () => void;
      openStockDetail: (asinDataList: AsinData) => void;
      receiveAsinData: (
        callback: (event: any, asinData: AsinData) => void
      ) => void;
      initSystemStatus: (callback: () => void) => void;
      initLogout: (callback: () => void) => Promise<void>;
      initLogin: (
        callback: (
          event: any,
          savedEmail: string,
          savedPassword: string
        ) => Promise<void>
      ) => Promise<void>;
      initScraping: (callback: () => void) => Promise<void>;
      initScheduledTime: (callback: () => void) => Promise<void>;
      startScheduledScraping: (callback: () => void) => void;
      scheduledScraping: (time: string) => void;
      loadTransferData: (
        callback: (event: Electron.IpcRendererEvent, data: AsinData[]) => void
      ) => void;
      disposeAllListeners: () => void;
      getAppURL: () => Promise<string>;
      disposeListener: (
        channel: string,
        callback: (event: any, asinData: AsinData) => void
      ) => void;
    };
  }

  type RootState = ReturnType<typeof store.getState>;
  type AppDispatch = typeof store.dispatch;

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
    isDeleteCheck: boolean;
    asin: string;
    imageURL: string;
    name: string;
    amazonSellerNOP: number | null;
    fbaSellerNOP: number | null;
    totalStock: number | null;
    cartPrice: string;
    decrease1: number;
    decrease2: number;
    fetchLatestDate: string;
    fetchLatestTime: string;
    asinParent: string;
    fbaSellerDatas: FbaSellerData[];
    isScraping: boolean | null;
  }

  interface FbaSellerData {
    sellerId: string;
    sellerName: string;
    stockCountDatas: StockCountData[];
  }

  /// key が日付 value が在庫数の型定義です。
  interface StockCountData {
    [date: string]: number;
  }

  interface User {
    uid: string;
    email: string | null;
    password: string;
    isAuthed: boolean;
    isAutoLogIn: boolean;
    plan: string;
    createdAt: string;
  }

  interface SystemStatus {
    systemStatus: number;
    showButtonStatus: number;
    isScheduledScrapingAble: boolean;
    scheduledScrapingTime: string;
  }

  interface IsAutoLoginProps {
    isChecked?: boolean;
    handleCheckBoxChange?: (value: boolean) => void;
  }

  interface StockDetailProps {
    columnHeader?: string[];
    data?: any;
    selectedSellerIndex?: number | null;
    onChange?: (dates: [Date, Date]) => void;
    setSelectedSellerIndex?: (index: number) => void;
  }

  interface ConfirmReExcuteDialogProps {
    isOpenConfirmReExcuteDialog: boolean;
    setIsOpenConfirmReExcuteDialog: React.Dispatch<
      React.SetStateAction<boolean>
    >;
  }

  interface ConfirmDeleteDataDialogProps {
    isOpenConfirmDeleteDataDialog: boolean;
    setIsOpenConfirmDeleteDataDialog: React.Dispatch<
      React.SetStateAction<boolean>
    >;
  }

  interface ConfirmDeleteAmazonDialogProps {
    isOpenConfirmDeleteAmazonDialog: boolean;
    setIsOpenConfirmDeleteAmazonDialog: React.Dispatch<
      React.SetStateAction<boolean>
    >;
  }

  interface ConfirmDeleteFbaDialogProps {
    isOpenConfirmDeleteFbaDialog: boolean;
    setIsOpenConfirmDeleteFbaDialog: React.Dispatch<
      React.SetStateAction<boolean>
    >;
  }

  interface ConfirmDeleteUncheckedDialogProps {
    isOpenConfirmDeleteUncheckedDialog: boolean;
    setIsOpenConfirmDeleteUncheckedDialog: React.Dispatch<
      React.SetStateAction<boolean>
    >;
  }

  // フォームの型
  interface CreateAccountFormInput {
    email: string;
    password: string;
    confirmPassword: string;
  }
}

// tsの構文では
// declare global を使う場合は、
// ファイルの最後に空の export {} を追加することで、
// エクスポート可能なモジュールとして扱えます。

// これにより、レンダラープロセスのグローバルな型定義を
// tsの構文で正しく適用しつつ、
// ファイルをモジュールとしてメインプロセスにインポートできます。
export {};
