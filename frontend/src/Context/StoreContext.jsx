/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";

import { food_list as localFoodList, foodImageMap } from "../assets/assets.js";
import { apiRequest } from "../services/api.js";

export const StoreContext = createContext(null);

const TOKEN_KEY = "food-app-token";
const GUEST_CART_KEY = "food-app-guest-cart";

const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || "";

const getGuestCart = () => {
  try {
    const rawCart = localStorage.getItem(GUEST_CART_KEY);
    if (!rawCart) {
      return {};
    }
    const parsedCart = JSON.parse(rawCart);
    if (!parsedCart || typeof parsedCart !== "object" || Array.isArray(parsedCart)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsedCart)
        .map(([itemId, quantity]) => [String(itemId), Number(quantity)])
        .filter(([, quantity]) => Number.isInteger(quantity) && quantity > 0),
    );
  } catch {
    return {};
  }
};

const saveGuestCart = (cart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

const incrementCartItem = (cart, itemId, amount = 1) => ({
  ...cart,
  [itemId]: (cart[itemId] || 0) + amount,
});

const normalizeProduct = (product) => ({
  ...product,
  _id: String(product.id),
  image: foodImageMap[product.image] || product.image,
});

const StoreContextProvider = (props) => {
  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItem] = useState(getGuestCart());
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [authLoading, setAuthLoading] = useState(Boolean(getStoredToken()));
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState({
    provider: "demo",
    label: "Demo Payment",
  });

  const isAuthenticated = Boolean(token);

  const applyCartResponse = (data) => {
    setCartItem(data.cart_items || {});
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const products = await apiRequest("/products");
      const normalizedProducts = products.map(normalizeProduct);
      setFoodList(normalizedProducts.length > 0 ? normalizedProducts : localFoodList);
    } catch {
      // Keep the storefront usable even when the API is unavailable.
      setFoodList(localFoodList);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadPaymentConfig = async () => {
    try {
      const config = await apiRequest("/payments/config");
      setPaymentConfig(config);
    } catch {
      setPaymentConfig({
        provider: "demo",
        label: "Demo Payment",
      });
    }
  };

  const fetchCart = async (accessToken = token) => {
    if (!accessToken) {
      const guestCart = getGuestCart();
      setCartItem(guestCart);
      return guestCart;
    }

    const cart = await apiRequest("/cart", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    applyCartResponse(cart);
    return cart.cart_items;
  };

  const syncGuestCart = async (accessToken) => {
    const guestCart = getGuestCart();
    const hasGuestItems = Object.keys(guestCart).length > 0;

    if (hasGuestItems) {
      try {
        const syncedCart = await apiRequest("/cart/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ items: guestCart }),
        });
        applyCartResponse(syncedCart);
        localStorage.removeItem(GUEST_CART_KEY);
        return;
      } catch {
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }

    await fetchCart(accessToken);
  };

  useEffect(() => {
    loadProducts();
    loadPaymentConfig();
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setUser(null);
        setCartItem(getGuestCart());
        setAuthLoading(false);
        return;
      }

      try {
        setAuthLoading(true);
        const currentUser = await apiRequest("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const cart = await apiRequest("/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(currentUser);
        applyCartResponse(cart);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setUser(null);
        setCartItem(getGuestCart());
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, [token]);

  const updateGuestCart = (updater) => {
    setCartItem((prev) => {
      const nextCart = updater(prev);
      saveGuestCart(nextCart);
      return nextCart;
    });
  };

  const addToCart = async (itemId) => {
    if (!isAuthenticated) {
      updateGuestCart((prev) => incrementCartItem(prev, itemId, 1));
      return;
    }

    try {
      const updatedCart = await apiRequest("/cart/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: itemId, quantity: 1 }),
      });
      applyCartResponse(updatedCart);
      showNotification("Item added to cart.", "success");
    } catch {
      // Fall back to local cart so the UI still works during API hiccups.
      updateGuestCart((prev) => incrementCartItem(prev, itemId, 1));
      showNotification("Item added locally. It will sync when the connection is ready.", "info");
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      updateGuestCart((prev) => {
        const currentQuantity = prev[itemId] || 0;
        if (currentQuantity <= 1) {
          const nextCart = { ...prev };
          delete nextCart[itemId];
          return nextCart;
        }
        return {
          ...prev,
          [itemId]: currentQuantity - 1,
        };
      });
      return;
    }

    const currentQuantity = cartItems[itemId] || 0;
    try {
      const updatedCart =
        currentQuantity <= 1
          ? await apiRequest(`/cart/items/${itemId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : await apiRequest(`/cart/items/${itemId}`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ product_id: itemId, quantity: currentQuantity - 1 }),
            });

      applyCartResponse(updatedCart);
      showNotification("Cart updated.", "success");
    } catch {
      updateGuestCart((prev) => {
        const quantity = prev[itemId] ?? currentQuantity;
        if (quantity <= 1) {
          const nextCart = { ...prev };
          delete nextCart[itemId];
          return nextCart;
        }
        return {
          ...prev,
          [itemId]: quantity - 1,
        };
      });
      showNotification("Cart updated locally.", "info");
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCartItem({});
      localStorage.removeItem(GUEST_CART_KEY);
      return;
    }

    const updatedCart = await apiRequest("/cart/clear", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    applyCartResponse(updatedCart);
  };

  const register = async ({ name, email, password }) => {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    await syncGuestCart(response.access_token);
    showNotification("Account created successfully.", "success");
    return response.user;
  };

  const login = async ({ email, password }) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    await syncGuestCart(response.access_token);
    showNotification("Logged in successfully.", "success");
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setCartItem(getGuestCart());
    showNotification("Logged out successfully.", "info");
  };

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((totalAmount, [itemId, quantity]) => {
      if (quantity <= 0) {
        return totalAmount;
      }
      const itemInfo = food_list.find((product) => product._id === itemId);
      return totalAmount + (itemInfo?.price || 0) * quantity;
    }, 0);
  };

  const getDeliveryFee = () => (getTotalCartAmount() === 0 ? 0 : 2);

  const createCheckoutSession = async (payload) => {
    setOrderSubmitting(true);
    try {
      return await apiRequest("/orders/checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const verifyPaymentSession = async (orderId, sessionId) => {
    const response = await apiRequest("/payments/verify-session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ order_id: orderId, session_id: sessionId }),
    });
    await fetchCart(token);
    return response;
  };

  const contextValue = {
    food_list,
    cartItems,
    setCartItem,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    getDeliveryFee,
    register,
    login,
    logout,
    user,
    token,
    isAuthenticated,
    loadingProducts,
    authLoading,
    createCheckoutSession,
    verifyPaymentSession,
    orderSubmitting,
    paymentConfig,
    notification,
    clearNotification,
    showNotification,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
