import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AsinDataListState = { value: [] };

// createSlice: {state, reducer, ActionCreator}の枠組みを簡単に作成できる関数
// 「stateの初期値」「reducerの関数定義」をすれば、
// ActionCreatorは(関数のプロバイダーだと思えばいい、Riverpodのrefのようなもの)
// バックグランド自動的に生成されている。
export const asinSlice = createSlice({
  name: "asinDataListSlice",
  initialState: initialState,
  // 更新関数の定義
  reducers: {
    // 引数のstate: 現在の状態
    addAsin: (state, action: PayloadAction<AsinData[]>) => {
      // state.valueには、
      // 「AsinData型オブジェクトを要素とした配列」を「valueプロパティ」にもつ
      // 「AsinState型オブジェクト」が格納されている。
      // pushメソッドで以下の操作をします。
      // action.payloadで呼び出せるデータは
      // 「PayloadAction<>型」のデータであり
      // 今回は<AsinData[]>の配列をvalueとして格納してるので
      // この配列を...のスプレッド構文で要素分解して
      // push(引数1,引数2,)の構文で順々に末尾に追加しています。
      // PayloadAction型は、
      //ペイロード（データ）を型引数に持つPayloadActionオブジェクトを意味します。
      // console.log("action.payload:", action.payload);
      state.value.push(...action.payload);
      // console.log("state.value after push:", state.value);
    },

    deleteAsin: (state, action) => {
      // asinは、配列の現在の要素です。
      // asin.asinは、現在の要素のasinプロパティです。
      // action.paylodは、入力した削除対象のASINです。

      // filterメソッドで、状態管理してるasinListの各要素に対して
      // 引数の削除対象のasinこ一致してるかどうかをチェックする
      // 一致してない場合のみ ! でTrueとなって、新規配列に加えられる
      state.value = state.value.filter(
        (asin: AsinData) => !action.payload.includes(asin.asin)
      );
    },
  },
});

// asinSlice.actionsオブジェクトから
// addAsinとdeleteAsinというプロパティを抽出し、
// 各々を同名の"addAsin" "deleteAsin" という名前の変数に
// 割り当てるための分割代入を使用した文法です。
export const { addAsin, deleteAsin } = asinSlice.actions;
// Reduxストアは、アプリケーションの全状態を管理します。
// ストアを作成する際には、リデューサーを渡す必要があるので
// reducerもエクスポートしておきます。
// asinSlice.reducerには、createSlice関数で作成した
// 全てのreducerが含まれてます。
export default asinSlice.reducer;
