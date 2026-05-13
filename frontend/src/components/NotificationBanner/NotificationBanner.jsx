import React from "react";

const NotificationBanner = ({ notification, onClose }) => {
  if (!notification?.message) {
    return null;
  }

  return (
    <div className={`notification-banner ${notification.type || "info"}`}>
      <span>{notification.message}</span>
      <button type="button" onClick={onClose}>
        x
      </button>
    </div>
  );
};

export default NotificationBanner;
