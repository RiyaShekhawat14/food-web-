import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ canAccess, children }) => {
  const location = useLocation();

  if (!canAccess) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
