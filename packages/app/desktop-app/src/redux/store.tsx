import { combineReducers, configureStore } from "@reduxjs/toolkit";
import asinDataListSlice from "./asinDataListSlice";
import systemStatusSlice from "./systemStatusSlice";
import userSlice from "./userSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

// store: 状態(=state)と、状態変更関数のreducer(=Notifier)をまとめて、各sliceを格納したコンテナ
// このstoreというコンテナ内の情報を安全にグローバルに公開するのがProvider
// ReduxのProviderの概念はFlutterのRiverpodと同じと考えていい。

// persist config
const persistConfig = {
  key: "root",
  storage,
};

// combineReducers: reducerを1つのオブジェクトにまとめる関数
const rootReducer = combineReducers({
  // 左側の asinDataList はプロパティ名でスライスの名前（キー）です。
  // 右側の asinDataListSlice はそのスライスからインポートしたリデューサー関数です。
  asinDataList: asinDataListSlice,
  systemStatus: systemStatusSlice,
  user: userSlice,
});

// 永続化の設定を含めた各リデューサーを一括したオブジェクトを作成
const persistedReducer = persistReducer(persistConfig, rootReducer);

// configureStore: storeを簡単に作ることのできる関数
export const store = configureStore({
  reducer: persistedReducer,
});

// storeを永続用のオブジェクトに変換
export const persistor = persistStore(store);

// ■ RootState型 & DisPatch型をエクスポート(global.d.tsで代わりに宣言)
// store.getState()の戻り値の型（ストアの状態の型）を取得し、
// それを現在アプリ全体の状態、つまりのRootStateとしてエクスポートします。
// RootStateは、Reduxストアの全体の状態ツリーの型を表します。
// Reduxストアは、アプリケーション全体の状態を管理する中心的な場所であり、
// 状態はスライスごとに管理されます。
// RootStateは、その全てのスライスの状態を統合した型です。
// これを使うことで、アプリケーションのどの部分でも
// ストアの状態の構造と内容を型安全に扱うことができます。
// export type RootState = ReturnType<typeof store.getState>;

// ■ RootState型 & DisPatch型をエクスポート(global.d.tsで代わりに宣言)
// store.dispatchの型を取得し、それをAppDispatchとしてエクスポートします。
// dispatch関数は、
// アクションをストアに送信するために使用されます。
// TypeScriptでこの型を定義することで、
// アクションのディスパッチが型安全に行われるようになります。
// export type AppDispatch = typeof store.dispatch;
