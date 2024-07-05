import React from "react";
import { AuthedLoginSection } from "./AuthedLoginSection";
import AuthedAccountSection from "./AuthedAccountSection";
import AuthedScrapeSection from "./AuthedScrapeSection";
import "./AuthedSetting.css";

const AuthedSetting = () => {
  return (
    <>
      <hr className="authed-setting-divider" />
      <AuthedLoginSection />
      <hr className="authed-setting-divider" />
      <AuthedAccountSection />
      <hr className="authed-setting-divider" />
      <AuthedScrapeSection />
      <hr className="authed-setting-divider" />
    </>
  );
};

export default AuthedSetting;
