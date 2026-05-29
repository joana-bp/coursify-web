import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("coursify_role");

    if (!token) {
      setAllowed(false);
    } else if (requiredRole && role !== requiredRole && role !== "superadmin") {
      setAllowed(false);
    } else {
      setAllowed(true);
    }
    setChecked(true);
  }, [requiredRole]);

  if (!checked) return null; // wait before rendering anything

  if (!allowed) {
    const token = localStorage.getItem("token");
    return <Navigate to={token ? "/dashboard" : "/"} replace />;
  }

  return children;
} 