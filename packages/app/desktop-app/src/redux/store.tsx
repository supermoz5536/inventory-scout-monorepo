import { configureStore } from "@reduxjs/toolkit";
import asinDataListSlice from "./asinDataListSlice";
import deleteCheckBoxSlice from "./deleteCheckBoxSlice";

// store: 状態(=state)と、状態変更関数のreducer(=Notifier)をまとめて、各sliceを格納したコンテナ
// このstoreというコンテナ内の情報を安全にグローバルに公開するのがProvider
// ReduxのProviderの概念はFlutterのRiverpodと同じと考えていい。

// configureStore: storeを簡単に作ることのできる関数
export const store = configureStore({
  reducer: {
    // プロパティ名はSlice名（＝グローバル管理する値の関連名）
    // riverpodのproviderの.dartファイルにつける名前と同じと考えて良い
    asinDataList: asinDataListSlice,
    deleteCheckBox: deleteCheckBoxSlice,
  },
});

// RootStateの型をエクスポート
// store.getState()の戻り値の型（ストアの状態の型）を取得し、
// それを現在アプリ全体の状態、つまりのRootStateとしてエクスポートします。
// RootStateは、Reduxストアの全体の状態ツリーの型を表します。
// Reduxストアは、アプリケーション全体の状態を管理する中心的な場所であり、
// 状態はスライスごとに管理されます。
// RootStateは、その全てのスライスの状態を統合した型です。
// これを使うことで、アプリケーションのどの部分でも
// ストアの状態の構造と内容を型安全に扱うことができます。
export type RootState = ReturnType<typeof store.getState>;

// DisPatchの型をエクスポート
// store.dispatchの型を取得し、それをAppDispatchとしてエクスポートします。
// dispatch関数は、
// アクションをストアに送信するために使用されます。
// TypeScriptでこの型を定義することで、
// アクションのディスパッチが型安全に行われるようになります。
export type AppDispatch = typeof store.dispatch;
