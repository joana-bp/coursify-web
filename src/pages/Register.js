import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoText from "../assets/logo-text.png";
import coursifyLogo from "../assets/coursify-logo.png";
import "../styles/Login.css";
import "../styles/Register.css";
import API_BASE_URL from "../config/api";

function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Password must contain at least one special character.";
  return null;
}

function PasswordStrengthBar({ password }) {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*(),.?\":{}|<>]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="password-hint">
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: "4px", borderRadius: "2px",
            background: i < passed ? colors[passed-1] : "#e5e7eb",
            transition: "background 0.3s"
          }} />
        ))}
      </div>
      {password.length > 0 && (
        <div style={{ fontSize: "11px", color: colors[passed-1] || "#9ca3af", marginBottom: "4px" }}>
          {passed > 0 ? labels[passed-1] : "Too weak"}
        </div>
      )}
      <ul>
        <li className={checks.length    ? "valid" : ""}>{checks.length    ? "✓" : "○"} At least 8 characters</li>
        <li className={checks.uppercase ? "valid" : ""}>{checks.uppercase ? "✓" : "○"} One uppercase letter</li>
        <li className={checks.number    ? "valid" : ""}>{checks.number    ? "✓" : "○"} One number</li>
        <li className={checks.special   ? "valid" : ""}>{checks.special   ? "✓" : "○"} One special character (!@#$...)</li>
      </ul>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [code, setCode]                       = useState("");
  const [step, setStep]                       = useState(1);
  const [message, setMessage]                 = useState("");
  const [isError, setIsError]                 = useState(false);
  const [loading, setLoading]                 = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(""); setIsError(false);
    if (!fullName || !email || !password || !confirmPassword) {
      setIsError(true); setMessage("Please fill in all fields."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIsError(true); setMessage("Please enter a valid email address."); return;
    }
    const strengthError = validatePassword(password);
    if (strengthError) { setIsError(true); setMessage(strengthError); return; }
    if (password !== confirmPassword) {
      setIsError(true); setMessage("Passwords do not match."); return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: fullName, email, password }),
      });
      let data;
      try { data = await response.json(); } catch { throw new Error("Invalid server response."); }
      if (!response.ok) throw new Error(data.detail || "Registration failed.");
      setIsError(false);
      setMessage(data.message || "Verification code sent to your email.");
      setStep(2);
    } catch (error) {
      setIsError(true); setMessage(error.message);
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage(""); setIsError(false);
    if (!code) { setIsError(true); setMessage("Please enter the verification code."); return; }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      let data;
      try { data = await response.json(); } catch { throw new Error("Invalid server response."); }
      if (!response.ok) throw new Error(data.detail || "Verification failed.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("coursify_role", data.user?.role);
      setIsError(false);
      setMessage("Registration successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      setIsError(true); setMessage(error.message);
    } finally { setLoading(false); }
  };

  return (
    <main className="split-page">
      <section className="split-left">
        <div className="logo-container">
          <img src={logoText} alt="Coursify logo" className="logo-text" />
        </div>
        <div className="brand-content">
          <h1>Know yourself. Find your path.</h1>
          <p>Get personalized college course recommendations based on your strengths, interests, and potential!</p>
        </div>
      </section>
      <section className="split-right">
        <div className="form-container register-form-container">
          <div className="form-logo-container">
            <img src={coursifyLogo} alt="Coursify icon" className="form-logo" />
          </div>
          {step === 1 ? (
            <>
              <h2>Create Account</h2>
              <p>Join Coursify and start your journey!</p>
              <form onSubmit={handleRegister} noValidate>
                <div className="input-box">
                  <span className="input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="box-input" disabled={loading} />
                </div>
                <div className="input-box">
                  <span className="input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  </span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="box-input" disabled={loading} />
                </div>
                <div className="input-box">
                  <span className="input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="box-input" disabled={loading} />
                  <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {password.length > 0 && <PasswordStrengthBar password={password} />}
                <div className="input-box">
                  <span className="input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="box-input" disabled={loading} />
                  <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {message && <p className={`message ${!isError ? "success-message" : ""}`} role="alert">{message}</p>}
                <button type="submit" className="primary-btn" style={{ marginTop: "16px" }} disabled={loading}>
                  {loading ? "Sending code..." : "REGISTER"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Verify Your Email</h2>
              <p>We sent a 6-digit code to <strong>{email}</strong></p>
              <form onSubmit={handleVerify} noValidate>
                <div className="input-box">
                  <span className="input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  </span>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter 6-digit code" className="box-input" maxLength={6} disabled={loading} />
                </div>
                {message && <p className={`message ${!isError ? "success-message" : ""}`} role="alert">{message}</p>}
                <button type="submit" className="primary-btn" style={{ marginTop: "16px" }} disabled={loading}>
                  {loading ? "Verifying..." : "VERIFY & COMPLETE"}
                </button>
                <button type="button" className="primary-btn"
                  style={{ marginTop: "8px", background: "transparent", border: "1px solid #20AFAB", color: "#20AFAB" }}
                  onClick={() => { setStep(1); setCode(""); setMessage(""); setIsError(false); }}
                  disabled={loading}>
                  ← Back
                </button>
              </form>
            </>
          )}
          <p className="signup-link">
            Already have an account?{" "}
            <Link to="/" style={{ color: "#20AFAB", fontWeight: "600", textDecoration: "none" }}>Login Here</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;