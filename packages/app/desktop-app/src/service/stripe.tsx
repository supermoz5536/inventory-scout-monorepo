import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const handleRedirectToCheckout = async (sessionId: any) => {
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

export default handleRedirectToCheckout;
