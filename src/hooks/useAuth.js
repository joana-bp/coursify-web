import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

export function useAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // Validate fields
    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data;

      try {
        data = await response.json();
        console.log("LOGIN RESPONSE:", data);
      } catch {
        throw new Error("Invalid server response.");
      }

      // Handle backend errors
      if (!response.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      // Save auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("coursify_user", JSON.stringify(data.user));
      localStorage.setItem("coursify_role", data.user?.role);

      // add these:
      console.log("SAVED coursify_role:", localStorage.getItem("coursify_role"));
      console.log("SAVED coursify_user:", localStorage.getItem("coursify_user"));
      console.log("NAVIGATING TO role:", data.user?.role);

      setMessage("Login successful!");

      // Redirect based on role
      const role = data.user?.role;

      if (role === "superadmin") {
        navigate("/superadmin/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,

    password,
    setPassword,

    message,

    showPassword,
    setShowPassword,

    loading,

    handleSubmit,
  };
}