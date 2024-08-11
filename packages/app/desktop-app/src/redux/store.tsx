import { combineReducers, configureStore } from "@reduxjs/toolkit";
import asinDataListSlice from "../slices/asinDataListSlice";
import systemStatusSlice from "../slices/systemStatusSlice";
import userSlice from "../slices/userSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import {
  createStateSyncMiddleware,
  initMessageListener,
  withReduxStateSync,
} from "redux-state-sync";

// store: 状態(=state)と、状態変更関数のreducer(=Notifier)をまとめて、各sliceを格納したコンテナ
// このstoreというコンテナ内の情報を安全にグローバルに公開するのがProvider
// ReduxのProviderの概念はFlutterのRiverpodと同じと考えていい。

// persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["asinDataList", "user", "systemStatus"], // 保存するリデューサーを指定
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

// ミドルウェアでアクションを処理する際の設定
const config = {
  predicate: (action: any) => {
    // actionに関数が含まれている場合は、
    // containsFunction === trueとなります。
    const containsFunction = (obj: any): boolean => {
      if (typeof obj === "function") return true;
      if (obj && typeof obj === "object") {
        // Object.values(obj)が
        // オブジェクトのすべての値を配列として返し、
        // その配列内に関数が含まれているか確認します。
        return Object.values(obj).some(containsFunction);
      }
      return false;
    };
    // predicateはフィルタリングする関数なので
    // predictate === falseの場合のみ
    // そのオブジェクトを通過させるため
    // 結果を反転させてreturnします。
    return !containsFunction(action);
  },
};

// configureStore: storeを簡単に作ることのできる関数
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createStateSyncMiddleware(config) as any),
});

// storeを永続用のオブジェクトに変換
const persistor = persistStore(store);

// initMessageListenerを初期化
// store の設定やリスナーの初期化を行います
initMessageListener(store);

export { persistor, store };

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
