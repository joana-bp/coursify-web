import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoText from "../assets/logo-text.png";
import coursifyLogo from "../assets/coursify-logo.png";
import "../styles/Login.css";
import API_BASE_URL from "../config/api";

// ── Password strength validator (mirrors backend rules) ──
function validatePassword(password) {
  if (password.length < 8)
    return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number.";
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
    return "Password must contain at least one special character.";
  return null;
}

function PasswordStrengthBar({ password }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: "4px", borderRadius: "2px",
            background: i < passed ? colors[passed - 1] : "#e5e7eb",
            transition: "background 0.3s"
          }} />
        ))}
      </div>
      {password.length > 0 && (
        <div style={{ fontSize: "11px", color: colors[passed - 1] || "#9ca3af" }}>
          {passed > 0 ? labels[passed - 1] : "Too weak"}
        </div>
      )}
      <ul style={{ fontSize: "11px", color: "#6b7280", paddingLeft: "16px", margin: "4px 0 0" }}>
        <li style={{ color: checks.length ? "#22c55e" : "#9ca3af" }}>{checks.length ? "✓" : "○"} At least 8 characters</li>
        <li style={{ color: checks.uppercase ? "#22c55e" : "#9ca3af" }}>{checks.uppercase ? "✓" : "○"} One uppercase letter</li>
        <li style={{ color: checks.number ? "#22c55e" : "#9ca3af" }}>{checks.number ? "✓" : "○"} One number</li>
        <li style={{ color: checks.special ? "#22c55e" : "#9ca3af" }}>{checks.special ? "✓" : "○"} One special character</li>
      </ul>
    </div>
  );
}

// ── Forgot Password Modal (3 steps) ──
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setMessage(""); setIsError(false);
    if (!email) { setIsError(true); setMessage("Please enter your email."); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed.");
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setIsError(true); setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage(""); setIsError(false);
    if (!code) { setIsError(true); setMessage("Please enter the code."); return; }
    try {
      setLoading(true);
      const res = await fetch(`$API_BASE_URL/api/auth/reset-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed.");
      setResetToken(data.reset_token);
      setMessage("Code verified! Enter your new password.");
      setStep(3);
    } catch (err) {
      setIsError(true); setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(""); setIsError(false);
    const strengthError = validatePassword(newPassword);
    if (strengthError) { setIsError(true); setMessage(strengthError); return; }
    if (newPassword !== confirmPass) { setIsError(true); setMessage("Passwords do not match."); return; }
    try {
      setLoading(true);
      const res = await fetch(`$API_BASE_URL/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed.");
      setIsError(false);
      setMessage(data.message);
      setTimeout(onClose, 2000);
    } catch (err) {
      setIsError(true); setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "32px",
        width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        position: "relative"
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "none", border: "none", fontSize: "20px",
          cursor: "pointer", color: "#9ca3af", lineHeight: 1
        }}>✕</button>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              flex: 1, height: "3px", borderRadius: "2px",
              background: i <= step ? "#20AFAB" : "#e5e7eb",
              transition: "background 0.3s"
            }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h3 style={{ margin: "0 0 8px", color: "#111" }}>Forgot Password?</h3>
            <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "14px" }}>
              Enter your email and we'll send you a reset code.
            </p>
            <form onSubmit={handleForgot}>
              <div className="input-box">
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
                  </svg>
                </span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address" className="box-input" disabled={loading} />
              </div>
              {message && <p style={{ fontSize: "13px", color: isError ? "#ef4444" : "#22c55e", margin: "8px 0" }}>{message}</p>}
              <button type="submit" className="primary-btn" style={{ marginTop: "12px" }} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ margin: "0 0 8px", color: "#111" }}>Check Your Email</h3>
            <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "14px" }}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerify}>
              <div className="input-box">
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input type="text" value={code} onChange={e => setCode(e.target.value)}
                  placeholder="Enter 6-digit code" className="box-input" maxLength={6} disabled={loading} />
              </div>
              {message && <p style={{ fontSize: "13px", color: isError ? "#ef4444" : "#22c55e", margin: "8px 0" }}>{message}</p>}
              <button type="submit" className="primary-btn" style={{ marginTop: "12px" }} disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button type="button" onClick={() => { setStep(1); setCode(""); setMessage(""); }}
                style={{ marginTop: "8px", background: "none", border: "none", color: "#20AFAB", cursor: "pointer", fontSize: "13px", display: "block" }}>
                ← Back
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ margin: "0 0 8px", color: "#111" }}>Set New Password</h3>
            <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "14px" }}>
              Choose a strong password for your account.
            </p>
            <form onSubmit={handleReset}>
              <div className="input-box">
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input type={showNew ? "text" : "password"} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New Password" className="box-input" disabled={loading} />
                <button type="button" className="input-icon-right" onClick={() => setShowNew(!showNew)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>

              {newPassword.length > 0 && <PasswordStrengthBar password={newPassword} />}

              <div className="input-box" style={{ marginTop: "8px" }}>
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input type={showConfirm ? "text" : "password"} value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Confirm New Password" className="box-input" disabled={loading} />
                <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>

              {message && <p style={{ fontSize: "13px", color: isError ? "#ef4444" : "#22c55e", margin: "8px 0" }}>{message}</p>}
              <button type="submit" className="primary-btn" style={{ marginTop: "12px" }} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Login Page ──
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!email || !password) { setMessage("Please fill in all fields."); return; }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try { data = await response.json(); } catch { throw new Error("Invalid server response."); }
      if (!response.ok) throw new Error(data.detail || "Login failed.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("coursify_user", JSON.stringify(data.user));
      localStorage.setItem("coursify_role", data.user?.role);
      setMessage("Login successful!");
      const role = data.user?.role;
      if (role === "superadmin") navigate("/superadmin/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="split-page">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* LEFT */}
      <section className="split-left">
        <div className="logo-container">
          <img src={logoText} alt="Coursify logo" className="logo-text" />
        </div>
        <div className="brand-content">
          <h1>Know yourself. Find your path.</h1>
          <p>Get personalized college course recommendations based on your strengths, interests, and potential!</p>
        </div>
      </section>

      {/* RIGHT */}
      <section className="split-right">
        <div className="form-container">
          <div className="form-logo-container">
            <img src={coursifyLogo} alt="Coursify icon" className="form-logo" />
          </div>

          <h2>Welcome Back</h2>
          <p>Log in to continue your journey!</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-box">
              <span className="input-icon-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
                </svg>
              </span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email Address" className="box-input" disabled={loading} />
            </div>

            <div className="input-box">
              <span className="input-icon-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password" className="box-input" disabled={loading} />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: "right", marginBottom: "8px" }}>
              <button type="button" onClick={() => setShowForgot(true)}
                style={{ background: "none", border: "none", color: "#20AFAB", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                Forgot Password?
              </button>
            </div>

            {message && <p className="message" role="alert">{message}</p>}

            <button type="submit" className="primary-btn" style={{ marginTop: "8px" }} disabled={loading}>
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#20AFAB", fontWeight: "600", textDecoration: "none" }}>
              Sign Up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;