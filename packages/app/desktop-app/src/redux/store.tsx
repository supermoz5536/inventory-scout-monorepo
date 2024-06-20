import { configureStore } from "@reduxjs/toolkit";

// store: 状態(=state)と、状態変更関数のreducer(=Notifier)をまとめて、各sliceを格納したコンテナ
// このstoreというコンテナ内の情報を安全にグローバルに公開するのがProvider
// ReduxのProviderの概念はFlutterのRiverpodと同じと考えていい。

// configureStore: storeを簡単に作ることのできる関数
const store = configureStore({
  reducer: {},
});
