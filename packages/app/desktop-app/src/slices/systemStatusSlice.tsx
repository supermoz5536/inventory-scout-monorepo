import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { value: SystemStatus } = {
  value: {
    systemStatus: 0,
    showButtonStatus: 0,
    isScheduledScrapingAble: false,
    scheduledScrapingTime: "00:00",
  },
};

// createSlice: {state, reducer, ActionCreator}の枠組みを簡単に作成できる関数
// 「stateの初期値」「reducerの関数定義」をすれば、
// ActionCreatorは(関数のプロバイダーだと思えばいい、Riverpodのrefのようなもの)
// バックグランド自動的に生成されている。
export const systemStatusSlice = createSlice({
  name: "systemStatusSlice",
  initialState: initialState,
  // 更新関数の定義
  reducers: {
    // システムメッセージの切り替え用のフラグを格納した状態変数です。
    changeSystemStatus: (state, action: PayloadAction<number>) => {
      //　以下の値を引数で指定して利用
      // 0 「""」
      // 1 「取得中...」
      // 2 「アプリ終了で中断された取得処理を自動で再開しました。現在取得中..」
      state.value.systemStatus = action.payload;
    },

    changeShowButtonStatus: (state, action: PayloadAction<number>) => {
      state.value.showButtonStatus = action.payload;
    },

    changeIsScheduledScrapingAble: (state, action: PayloadAction<boolean>) => {
      state.value.isScheduledScrapingAble = action.payload;
    },

    changeScheduledTime: (state, action: PayloadAction<string>) => {
      state.value.scheduledScrapingTime = action.payload;
    },
  },
});

// asinSlice.actionsオブジェクトから
// addAsinとdeleteAsinというプロパティを抽出し、
// 各々を同名の"addAsin" "deleteAsin" という名前の変数に
// 割り当てるための分割代入を使用した文法です。
export const {
  changeSystemStatus,
  changeShowButtonStatus,
  changeIsScheduledScrapingAble,
  changeScheduledTime,
} = systemStatusSlice.actions;
// Reduxストアは、アプリケーションの全状態を管理します。
// ストアを作成する際には、リデューサーを渡す必要があるので
// reducerもエクスポートしておきます。
// asinSlice.reducerには、createSlice関数で作成した
// 全てのreducerが含まれてます。
export default systemStatusSlice.reducer;
