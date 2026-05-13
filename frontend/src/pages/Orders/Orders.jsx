import React, { useContext, useEffect, useState } from "react";

import { StoreContext } from "../../Context/StoreContext";
import { apiRequest } from "../../services/api";

const Orders = () => {
  const { token, isAuthenticated } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      if (!isAuthenticated || !token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await apiRequest("/orders/mine", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (isMounted) {
          setOrders(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Could not load your orders.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  return (
    <div className="orders-page">
      <div className="orders-header">
        <p className="checkout-eyebrow">Database-backed records</p>
        <h1>My Orders</h1>
        <p className="checkout-copy">
          Every confirmed order shown here is being loaded from the backend database, not from frontend-only state.
        </p>
      </div>

      {loading ? <div className="orders-empty">Loading your orders...</div> : null}
      {!loading && error ? <div className="orders-empty">{error}</div> : null}
      {!loading && !error && orders.length === 0 ? (
        <div className="orders-empty">No orders yet. Place one from the cart and it will appear here.</div>
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="orders-card" key={order.id}>
              <div className="orders-card-top">
                <div>
                  <h2>Order #{order.id}</h2>
                  <p>
                    {order.first_name} {order.last_name} • {order.email}
                  </p>
                </div>
                <div className="orders-status-group">
                  <span className={`orders-badge ${order.status}`}>{order.status}</span>
                  <span className={`orders-badge ${order.payment_status}`}>{order.payment_status}</span>
                </div>
              </div>
              <div className="orders-grid">
                <span>Address</span>
                <strong>
                  {order.street}, {order.city}, {order.state}, {order.country}, {order.zip_code}
                </strong>
                <span>Phone</span>
                <strong>{order.phone}</strong>
                <span>Total</span>
                <strong>${order.total}</strong>
              </div>
              <div className="orders-items">
                {order.items.map((item) => (
                  <div className="orders-item" key={`${order.id}-${item.product_id}`}>
                    <span>{item.name}</span>
                    <strong>
                      {item.quantity} x ${item.unit_price}
                    </strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Orders;
