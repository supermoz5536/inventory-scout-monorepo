import React, { useState } from "react";
import "./MainWindow.css";
import { useNavigate } from "react-router-dom";
import { Tab, Tabs } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import Top from "./Top";
import Manage from "./Manage";

const MainWindow = () => {
  const navigate = useNavigate();
  const [isSelectedTab, setIsSelectedTab] = useState<any>();

  const handleChangeTab = (
    event: React.SyntheticEvent<Element, Event>,
    value: any
  ) => {
    setIsSelectedTab(value);
  };

  // navigate("/Top");
  // navigate("/Manage");

  return (
    <div>
      <TabContext value={isSelectedTab}>
        <Tabs value={isSelectedTab} onChange={handleChangeTab}>
          <Tab value="0" label="トップ画面" />
          <Tab value="1" label="リスト管理画面" />
        </Tabs>
        <TabPanel value="0">
          <Top />
        </TabPanel>
        <TabPanel value="1">
          <Manage />
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default MainWindow;
