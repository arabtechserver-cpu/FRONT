"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function WalletPayPalButtons({ amount, createOrder, onApprove, onError }) {
  return (
    <PayPalScriptProvider
      options={{
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "BAA8Rt-IgLlxgkq8MZ8oiOOqDhFqy92HBS9sxJzeYASwt8YU9Lz7GXrMAiACDFotqS5LlCxBsRISofo6n8",
        currency: "USD"
      }}
    >
      <PayPalButtons
        forceReRender={[amount]}
        style={{ layout: "vertical", shape: "rect", color: "gold", label: "paypal" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
}
