import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { value: User } = {
  value: {
    uid: "",
    email: "",
    password: "",
    isAuthed: false,
    isAutoLogIn: false,
    is_cancel_progress: false,
    plan: "",
    createdAt: "",
  },
};

// createSlice: {state, reducer, ActionCreator}の枠組みを簡単に作成できる関数
// 「stateの初期値」「reducerの関数定義」をすれば、
// ActionCreatorは(関数のプロバイダーだと思えばいい、Riverpodのrefのようなもの)
// バックグランド自動的に生成されている。
export const userSlice = createSlice({
  name: "userStatusSlice",
  initialState: initialState,
  // 更新関数の定義
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      state.value = action.payload;
    },
    changeUidOnStore: (state, action: PayloadAction<string>) => {
      state.value.uid = action.payload;
    },
    changeEmailOnStore: (state, action: PayloadAction<string>) => {
      state.value.email = action.payload;
    },
    changePasswordOnStore: (state, action: PayloadAction<string>) => {
      state.value.password = action.payload;
    },
    changeIsAuthed: (state, action: PayloadAction<boolean>) => {
      state.value.isAuthed = action.payload;
    },
    changeIsAutoLogIn: (state, action: PayloadAction<boolean>) => {
      state.value.isAutoLogIn = action.payload;
    },
    changePlanOnStore: (state, action: PayloadAction<string>) => {
      state.value.plan = action.payload;
    },
  },
});

// asinSlice.actionsオブジェクトから
// addAsinとdeleteAsinというプロパティを抽出し、
// 各々を同名の"addAsin" "deleteAsin" という名前の変数に
// 割り当てるための分割代入を使用した文法です。
export const {
  updateUser,
  changeUidOnStore,
  changeIsAuthed,
  changeIsAutoLogIn,
  changeEmailOnStore,
  changePasswordOnStore,
  changePlanOnStore,
} = userSlice.actions;
// Reduxストアは、アプリケーションの全状態を管理します。
// ストアを作成する際には、リデューサーを渡す必要があるので
// reducerもエクスポートしておきます。
// asinSlice.reducerには、createSlice関数で作成した
// 全てのreducerが含まれてます。
export default userSlice.reducer;
