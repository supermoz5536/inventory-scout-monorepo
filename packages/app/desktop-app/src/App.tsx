import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Top from "./pages/Top";
import Manage from "./pages/Manage";

const App: React.FC = () => {
  return (
    <div>
      <Routes>
        {/* ユーザーがアプリケーションのルートURL (/) にアクセスしたときに、
        /Topにリダイレクトするための設定です。 */}
        <Route path="/" element={<Navigate to="/Top" />} />
        {/* 各ページのURLパスと対応するコンポーネントをルートをマッピングしてます。 */}
        <Route path="/Top" element={<Top />} />
        <Route path="/Manage" element={<Manage />} />
      </Routes>
    </div>
  );
};

export default App;
