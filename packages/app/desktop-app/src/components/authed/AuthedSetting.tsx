import React from "react";
import { AuthedLoginSection } from "./AuthedLoginSection";
import AuthedAccountSection from "./AuthedAccountSection";
import AuthedScrapeSection from "./AuthedScrapeSection";

const AuthedSetting = () => {
  return (
    <>
      <AuthedLoginSection />
      <AuthedAccountSection />
      <AuthedScrapeSection />
    </>
  );
};

export default AuthedSetting;
