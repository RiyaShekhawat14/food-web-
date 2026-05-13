import React, { useContext, useState } from "react";
import { Route, Routes } from "react-router-dom";

import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Navbar from "./components/Navbar/Navbar.jsx";
import NotificationBanner from "./components/NotificationBanner/NotificationBanner.jsx";
import Cart from "./pages/Cart/Cart";
import DemoCheckout from "./pages/DemoCheckout/DemoCheckout";
import Home from "./pages/Home/Home";
import Orders from "./pages/Orders/Orders";
import PaymentStatus from "./pages/PaymentStatus/PaymentStatus";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import { StoreContext } from "./Context/StoreContext";


const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { clearNotification, isAuthenticated, notification } = useContext(StoreContext);
  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
      <NotificationBanner notification={notification} onClose={clearNotification} />
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder setShowLogin={setShowLogin} />} />
          <Route
            path="/demo-checkout"
            element={(
              <ProtectedRoute canAccess={isAuthenticated}>
                <DemoCheckout />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/orders"
            element={(
              <ProtectedRoute canAccess={isAuthenticated}>
                <Orders />
              </ProtectedRoute>
            )}
          />
          <Route path="/payment-status" element={<PaymentStatus />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
