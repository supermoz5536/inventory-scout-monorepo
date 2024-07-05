import React from "react";
import GuestAccountSection from "./GuestAccountSection";
import GuestLoginSection from "./GuestLoginSection";
import GuestScrapeSection from "./GuestScrapeSection";
import "./GuestSetting.css";

const LoggedOutSetting = () => {
  return (
    <>
      <hr className="guest-setting-divider" />
      <GuestLoginSection />
      <hr className="guest-setting-divider" />
      <GuestAccountSection />
      <hr className="guest-setting-divider" />
      <GuestScrapeSection />
      <hr className="guest-setting-divider" />
    </>
  );
};

export default LoggedOutSetting;
