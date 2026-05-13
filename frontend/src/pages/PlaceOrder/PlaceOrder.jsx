import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";

const PlaceOrder = ({ setShowLogin }) => {
  const { createCheckoutSession, getDeliveryFee, getTotalCartAmount, isAuthenticated, orderSubmitting, paymentConfig, user } =
    useContext(StoreContext);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const totalAmount = getTotalCartAmount();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    try {
      setError("");
      const response = await createCheckoutSession({
        ...formData,
        email: formData.email || user?.email || "",
      });
      window.location.href = response.checkout_url;
    } catch (checkoutError) {
      setError(checkoutError.message || "Could not start checkout.");
    }
  };
  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information </p>
        <p style={{ color: "#676767", fontSize: 14, marginBottom: 12 }}>
          Payment mode: {paymentConfig.label}
        </p>
        <div className="multi-fields">
          <input name="first_name" value={formData.first_name} onChange={handleChange} type="text" placeholder="First name" required />
          <input name="last_name" value={formData.last_name} onChange={handleChange} type="text" placeholder="last name" required />
        </div>
        <input name="email" value={formData.email || user?.email || ""} onChange={handleChange} type="email" placeholder="Email adresss" required />
        <input name="street" value={formData.street} onChange={handleChange} type="text" placeholder="Street" required />
        <div className="multi-fields">
          <input name="city" value={formData.city} onChange={handleChange} type="text" placeholder="City" required />
          <input name="state" value={formData.state} onChange={handleChange} type="text" placeholder="State" required />
        </div>
        <div className="multi-fields">
          <input name="zip_code" value={formData.zip_code} onChange={handleChange} type="text" placeholder="Zip code" required />
          <input name="country" value={formData.country} onChange={handleChange} type="text" placeholder="Country" required />
        </div>
        <input name="phone" value={formData.phone} onChange={handleChange} type="text" placeholder="Phone" required />
        {error ? <p style={{ color: "#b00020", marginTop: 10 }}>{error}</p> : null}

      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
        
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${totalAmount}</p>

            </div>

            <hr/>
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getDeliveryFee()}</p>

            </div>
            <hr/>
            <div className="cart-total-details">
              <b>Total</b>
              <b>${totalAmount===0?0:totalAmount+getDeliveryFee()}</b>

            </div>
            <button disabled={orderSubmitting || totalAmount === 0}>
              {orderSubmitting
                ? "REDIRECTING..."
                : paymentConfig.provider === "demo"
                  ? "PROCEED TO DEMO PAYMENT"
                  : "PROCEED TO PAYMENT"}
            </button>
          </div>

      </div>

    </form>
  );
};

export default PlaceOrder;
