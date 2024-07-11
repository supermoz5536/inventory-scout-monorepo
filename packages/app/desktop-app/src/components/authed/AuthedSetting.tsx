import React from "react";
import { AuthedLoginSection } from "./AuthedLoginSection";
import AuthedAccountSection from "./AuthedAccountSection";
import AuthedScrapeSection from "./AuthedScrapeSection";
import "./AuthedSetting.css";

const AuthedSetting = ({ isChecked }: IsAutoLoginProps) => {
  return (
    <>
      <hr className="authed-setting-divider" />
      <AuthedLoginSection isChecked={isChecked} />
      <hr className="authed-setting-divider" />
      <AuthedAccountSection />
      <hr className="authed-setting-divider" />
      <AuthedScrapeSection />
      <hr className="authed-setting-divider" />
    </>
  );
};

export default AuthedSetting;
