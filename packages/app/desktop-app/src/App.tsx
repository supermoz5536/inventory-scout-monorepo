import React, { useCallback, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  updateAsinData,
  updateIsScrapingTrueAll,
  updateWithLoadedData,
} from "./slices/asinDataListSlice";
import {
  changeShowButtonStatus,
  changeSystemStatus,
} from "./slices/systemStatusSlice";
import Top from "./pages/Top";
import Manage from "./pages/Manage";
import Setting from "./pages/Setting";
import LoginPrompt from "./pages/LoginPrompt";
import StockDetail from "./pages/StockDetail";
import {
  logInWithEmailAndPassword,
  listenAuthState,
  initLogoutCallBack,
} from "./firebase/authentication";
import { updateUser } from "./slices/userSlice";
import { DocumentData } from "firebase/firestore";
import { getUserDoc } from "./firebase/firestore";
import MainWindow from "./pages/MainWindow";
import BackGroundWindow from "./pages/BackGroundWindow";

const App: React.FC = () => {
  return (
    <div>
      <Routes>
        {/* ユーザーがアプリケーションのルートURL (/) にアクセスしたときに、
        /Topにリダイレクトするための設定です。 */}
        <Route path="/" element={<Navigate to="/MainWindow" />} />
        {/* 各ページのURLパスと対応するコンポーネントをルートをマッピングしてます。 */}
        <Route path="/Top" element={<Top />} />
        <Route path="/Manage" element={<Manage />} />
        <Route path="/Setting" element={<Setting />} />
        <Route path="/LoginPrompt" element={<LoginPrompt />} />
        <Route path="/StockDetail" element={<StockDetail />} />
        <Route path="/MainWindow" element={<MainWindow />} />
        <Route path="/BackGroundWindow" element={<BackGroundWindow />} />
      </Routes>
    </div>
  );
};

export default App;
