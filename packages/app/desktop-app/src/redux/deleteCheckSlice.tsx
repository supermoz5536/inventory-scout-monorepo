import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// createSlice: {state, reducer, ActionCreator}の枠組みを簡単に作成できる関数
// 「stateの初期値」「reducerの関数定義」をすれば、
// ActionCreatorは(関数のプロバイダーだと思えばいい、Riverpodのrefのようなもの)
// バックグランド自動的に生成されている。
export const deleteCheckSlice = createSlice({
  name: "deleteCheckSlice",
  initialState: false,
  // 更新関数の定義
  reducers: {
    reverseCheck: (state) => {
      // Redux Toolkit を用いる場合は
      // 自動でイミュータブルな処理を行ってくれますが
      // 以下の構文に従う必要があります。

      // プロパティを持たない状態オブジェクトの場合
      // return state = new state;

      // プロパティを持つオブジェクトの場合
      // state.プロパティ名 = new property value;
      return !state;
    },
  },
});

// deleteCheckSlice.actionsオブジェクトから
// reverseCheckというプロパティを抽出し、
// 同名の"deleteCheckSlice" という名前の変数に
// 割り当てるための分割代入を使用した文法です。
export const { reverseCheck } = deleteCheckSlice.actions;
// Reduxストアは、アプリケーションの全状態を管理します。
// ストアを作成する際には、リデューサーを渡す必要があるので
// reducerもエクスポートしておきます。
// deleteCheckSlice.reducerには、createSlice関数で作成した
// 全てのreducerが含まれてます。
export default deleteCheckSlice.reducer;
