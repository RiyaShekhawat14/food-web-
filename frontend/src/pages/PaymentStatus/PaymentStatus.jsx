import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { StoreContext } from "../../Context/StoreContext";
import { apiRequest } from "../../services/api";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const { paymentConfig, setCartItem, showNotification, token } = useContext(StoreContext);
  const [message, setMessage] = useState("Checking your payment status...");
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const status = searchParams.get("status");
    const orderId = searchParams.get("order_id");
    const sessionId = searchParams.get("session_id");

    if (status === "cancelled") {
      setMessage("Payment was cancelled. Your order is still pending, so you can try again.");
      setResolved(true);
      return;
    }

    if (status !== "success" || !orderId || !sessionId || !token) {
      setMessage("We could not verify this payment session.");
      setResolved(true);
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        const result = await apiRequest("/payments/verify-session", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order_id: Number(orderId), session_id: sessionId }),
        });
        if (!isMounted) {
          return;
        }
        setMessage(
          result.verified
            ? paymentConfig.provider === "demo"
              ? "Demo payment completed successfully. Your order has been confirmed."
              : "Payment verified successfully. Your order has been confirmed."
            : "Payment is still pending. Please refresh this page in a moment."
        );
        if (result.verified) {
          setCartItem({});
          showNotification("Order confirmed successfully.", "success");
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.message || "We could not verify your payment.");
        }
      } finally {
        if (isMounted) {
          setResolved(true);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [paymentConfig.provider, searchParams, setCartItem, showNotification, token]);

  return (
    <div className="cart" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <div className="cart-total" style={{ maxWidth: 560, width: "100%" }}>
        <h2>Payment Status</h2>
        <p style={{ marginTop: 12, lineHeight: 1.6 }}>{message}</p>
        {resolved ? (
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <Link to="/">
              <button>BACK TO HOME</button>
            </Link>
            <Link to="/orders">
              <button style={{ background: "transparent", color: "tomato", border: "1px solid tomato" }}>VIEW ORDERS</button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentStatus;
