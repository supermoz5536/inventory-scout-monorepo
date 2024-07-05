import React from "react";
import { AuthedLoginSection } from "./AuthedLoginSection";
import AuthedEmailSection from "./AuthedEmailSection";
import AuthedScrapeSection from "./AuthedScrapeSection";

const AuthedSetting = () => {
  return (
    <>
      <AuthedLoginSection />
      <AuthedEmailSection />
      <AuthedScrapeSection />
    </>
  );
};

export default AuthedSetting;
