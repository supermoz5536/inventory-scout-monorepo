import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Tab, Tabs } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import Top from "./Top";
import Manage from "./Manage";

const MainWindow = () => {
  const navigate = useNavigate();
  const [isSelectedTab, setIsSelectedTab] = useState<any>("0");

  const handleChangeTab = (
    event: React.SyntheticEvent<Element, Event>,
    value: any
  ) => {
    setIsSelectedTab(value);
  };

  // navigate("/Top");
  // navigate("/Manage");

  return (
    <TabContext value={isSelectedTab}>
      <Box
        component={"div"}
        className="main-window-tabs"
        sx={{
          backgroundColor: "#287fd5",
          boxShadow: 2,
          zIndex: 1, // ① zIndex は position が static 以外の場合にのみ機能する
          position: "relative", // ② なのでpositionを明示
        }}
      >
        <Tabs
          value={isSelectedTab}
          onChange={handleChangeTab}
          sx={{ minHeight: "45px", height: "45px" }}
        >
          <Tab value="0" label="トップ画面" sx={{ color: "white" }} />
          <Tab value="1" label="リスト管理画面" />
        </Tabs>
      </Box>

      <Box
        component={"div"}
        sx={{
          backgroundColor: "#f5f5f5",
          zIndex: 0,
        }}
      >
        <TabPanel value="0">
          <Top />
        </TabPanel>
        <TabPanel value="1">
          <Manage />
        </TabPanel>
      </Box>
    </TabContext>
  );
};

export default MainWindow;
