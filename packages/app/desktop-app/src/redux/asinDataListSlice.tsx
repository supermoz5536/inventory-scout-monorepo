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

    removeAsin: (state) => {
      // チェックされてないasinDataオブジェクトのみを
      // 返り値で取得して新たに配列を生成し、
      // 状態を更新します。
      state.value = state.value.filter(
        (asinData: AsinData) => asinData.isDeleteCheck == false
      );
    },

    switchRemoveCheck: (state, action: PayloadAction<string>) => {
      // Redux Toolkit を用いる場合は
      // 自動でイミュータブルな処理を行ってくれますが
      // 以下の構文に従う必要があります。
      // ■ プロパティを持たない状態オブジェクトの場合
      // return state = new state;
      // ■ プロパティを持つオブジェクトの場合
      // state.プロパティ名 = new property value;

      // findメソッドは、
      // 配列内の要素を検索し
      // 指定された条件を満たす最初の要素を返します。
      const asinDataChecked: AsinData | undefined = state.value.find(
        (asinData) => action.payload == asinData.id
      );

      if (asinDataChecked) {
        asinDataChecked.isDeleteCheck = !asinDataChecked.isDeleteCheck;
      }

      // removedelete;
    },

    /// メインプロセスから受信したAsinDataオブジェクトと
    /// 一致するオブジェクトを検索して更新する関数
    updateAsinData: (state, action: PayloadAction<AsinData>) => {
      // 既存のasinDataのリストの中で、.asinが一致するオブジェクトをfind
      // findIndex メソッドは、検索条件に一致する要素が見つかった場合、
      // その要素のインデックスを返します。
      // 一致する要素が見つからなかった場合は -1 を返します。
      const index = state.value.findIndex(
        (asinData: AsinData) => asinData.asin === action.payload.asin
      );

      if (index !== -1) {
        // そのasinDataオブジェクトを、引数のasinDataオブジェクトに上書きする
        state.value[index] = action.payload;
      } else {
        console.warn(`AsinData with ASIN ${action.payload.asin} not found`);
      }
    },

    /// ローカルストレージからロードしたデータで初期化処理を行う関数です。
    updateWithLoadedData: (state, action: PayloadAction<AsinData[]>) => {
      state.value = action.payload;
    },

    /// runScrapingを起動する直前に
    /// 全てのasinData要素のisScrapingを
    /// Trueにする関数
    updateIsScrapingTrueAll: (state) => {
      const arrayLength = state.value.length;
      for (let index = 0; index < arrayLength; ++index) {
        state.value[index].isScraping = true;
      }
    },

    /// 全ての削除用のCheckBoxの値を反転させる関数
    switchIsDeleteCheckAll: (state, action: PayloadAction<boolean>) => {
      const arrayLength = state.value.length;
      for (let index = 0; index < arrayLength; ++index) {
        state.value[index].isDeleteCheck = action.payload;
      }
    },

    setIsScrapingTrueForNewItems: (state) => {
      state.value.forEach((asinData) => {
        if (asinData.fetchLatestDate === "") {
          asinData.isScraping = true;
        }
      });
    },
  },
});

// asinSlice.actionsオブジェクトから
// addAsinとdeleteAsinというプロパティを抽出し、
// 各々を同名の"addAsin" "deleteAsin" という名前の変数に
// 割り当てるための分割代入を使用した文法です。
export const {
  addAsin,
  removeAsin,
  switchRemoveCheck,
  updateAsinData,
  updateIsScrapingTrueAll,
  switchIsDeleteCheckAll,
  updateWithLoadedData,
  setIsScrapingTrueForNewItems,
} = asinSlice.actions;
// Reduxストアは、アプリケーションの全状態を管理します。
// ストアを作成する際には、リデューサーを渡す必要があるので
// reducerもエクスポートしておきます。
// asinSlice.reducerには、createSlice関数で作成した
// 全てのreducerが含まれてます。
export default asinSlice.reducer;
