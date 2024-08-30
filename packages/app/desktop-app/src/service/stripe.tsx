import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { callCreateCheckoutSession } from "../firebase/cloudFunctions";

export const handleRedirectToCheckout = async (sessionId: any) => {
  // Stripeの公開可能APIキーを引数に渡す
  const stripePromise = loadStripe(
    "pk_live_51OwiwF02YGIp0FEBBCMInNVpI7hdnICCpkFC9aDxKW9nYL9aDdt36ps0AAkhBqjWmhXOIzup5cqKIe1XFKvzZvWv000C38OwkG",
  );

  // Stripのインスタンスを作成
  const stripe = await stripePromise;

  // エラーハンドリング
  if (!stripe) {
    console.error("Stripe has not been initialized");
    return;
  }

  // 生成したセッション画面へ遷移
  stripe.redirectToCheckout({
    sessionId: sessionId,
  });
};

export const handleCheckoutSessionAndRedirect = async (
  uid: string,
  selectedPlan: string,
) => {
  const appURL = await window.myAPI.getAppURL();
  const sessionId: any = await callCreateCheckoutSession(
    uid,
    appURL,
    selectedPlan,
  );
  // Stripeのチェックアウトセッション画面への遷移
  await handleRedirectToCheckout(sessionId);
};
