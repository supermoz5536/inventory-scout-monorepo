import React from "react";
import GuestEmailSection from "./GuestEmailSection";
import GuestLoginSection from "./GuestLoginSection";
import GuestScrapeSection from "./GuestScrapeSection";

const LoggedOutSetting = () => {
  return (
    <>
      <GuestLoginSection />
      <GuestEmailSection />
      <GuestScrapeSection />
    </>
  );
};

export default LoggedOutSetting;
