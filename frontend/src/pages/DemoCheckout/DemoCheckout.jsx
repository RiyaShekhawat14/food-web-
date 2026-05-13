import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { StoreContext } from "../../Context/StoreContext";

const DemoCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { paymentConfig, showNotification, token } = useContext(StoreContext);
  const [submitting, setSubmitting] = useState(false);

  const orderId = useMemo(() => searchParams.get("order_id"), [searchParams]);
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);

  const canContinue = Boolean(orderId && sessionId && token);

  const handleConfirm = async () => {
    if (!canContinue) {
      showNotification("Your session expired. Please place the order again.", "info");
      navigate("/cart");
      return;
    }

    setSubmitting(true);
    navigate(`/payment-status?status=success&order_id=${orderId}&session_id=${sessionId}`);
  };

  const handleCancel = () => {
    navigate(`/payment-status?status=cancelled&order_id=${orderId || ""}`);
  };

  return (
    <div className="checkout-shell">
      <div className="checkout-card">
        <p className="checkout-eyebrow">{paymentConfig.label}</p>
        <h1>Confirm Demo Payment</h1>
        <p className="checkout-copy">
          This project is using a free demo gateway. No money is charged. Clicking confirm will mark the
          current order as paid and store it in the database.
        </p>
        <div className="checkout-meta">
          <span>Order ID</span>
          <strong>#{orderId || "N/A"}</strong>
        </div>
        <div className="checkout-actions">
          <button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "PROCESSING..." : "CONFIRM PAYMENT"}
          </button>
          <button className="secondary" onClick={handleCancel} type="button">
            CANCEL
          </button>
        </div>
        <p className="checkout-hint">
          After confirmation, you can open <Link to="/orders">My Orders</Link> to verify the saved record.
        </p>
      </div>
    </div>
  );
};

export default DemoCheckout;
