import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { callCreateCheckoutSession } from "../firebase/cloudFunctions";

export const handleRedirectToCheckout = async (sessionId: any) => {
  // Stripeの公開可能APIキーを引数に渡す
  const stripePromise = loadStripe(
    "pk_test_51OwiwF02YGIp0FEBuakiQxnKE4QAXQoGSJpknDA5yYgB3q3uPCoP4V6a3XmBExB11V0Ap5AnW2oirFZK6Y4DKckZ00nAQ4xL7s"
  );
  const stripe = await stripePromise;

  if (!stripe) {
    console.error("Stripe has not been initialized");
    return;
  }
  console.log("sessionId", sessionId);
  stripe.redirectToCheckout({
    sessionId: sessionId,
  });
};

export const handleCreateCheckoutSessionAndRedirect = async (uid: string) => {
  const appURL = await window.myAPI.getAppURL();
  const sessionId: any = await callCreateCheckoutSession(uid, appURL);
  // Stripeのチェックアウトセッション画面への遷移
  await handleRedirectToCheckout(sessionId);
};
