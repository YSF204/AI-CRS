import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { loginSchema } from "../../../schema/auth.schema";
import useFormValidation from "../../../hooks/useFormValidation";
import AuthInput from "./components/AuthInput";
import ErrorBanner from "./components/ErrorBanner";
import api from "../../../services/api";

export default function LoginForm({ setMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgotLink, setShowForgotLink] = useState(false);

  const { errors, touched, touch, touchAll } = useFormValidation(loginSchema, {
    email,
    password,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    touchAll(["email", "password"]);
    setErrorMsg("");

    if (Object.keys(errors).length > 0) {
      setErrorMsg(Object.values(errors)[0]);
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.data.user);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 403) {
        if (err.response?.data?.role === 'EMPLOYER' && err.response?.data?.accountStatus === 'PENDING') {
          // Account exists but is PENDING approval — send to the waiting page
          navigate("/pending");
          return;
        }
      }
      setErrorMsg(err.response?.data?.message || "Invalid email or password");
      setShowForgotLink(true);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });

      if (res.status === 206 || res.data.requireProfileCompletion) {
        localStorage.setItem(
          "pendingGoogleRegistration",
          JSON.stringify({
            token: credentialResponse.credential,
            ...res.data.googleData,
          }),
        );
        // Notify SignupForm (which may already be mounted) to re-read the payload
        window.dispatchEvent(new Event("googlePayloadReady"));
        setMode?.("signup");
        return;
      }

      login(res.data.token, res.data.data.user);
      navigate("/");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Google login failed.");
    }
  };

  return (
    <form onSubmit={handleLogin} noValidate>
      <ErrorBanner message={errorMsg} />

      <AuthInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={touch("email")}
        onBlur={touch("email")}
        required
        error={touched.email ? errors.email : ""}
      />
      <AuthInput
        label="Password"
        showToggle
        showPw={showPw}
        onToggle={() => setShowPw(!showPw)}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={touch("password")}
        onBlur={touch("password")}
        required
        error={touched.password ? errors.password : ""}
      />

      <div style={{ textAlign: "right", marginBottom: 12 }}>
        {showForgotLink && (
          <a
            href="/forgot-password"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--nm-text-tertiary)",
              textDecoration: "none",
              fontWeight: 600,
              transition: "color 0.2s ease",
              display: "inline-block",
            }}
            className="hover:text-[var(--nm-primary)]"
          >
            Forgot Password?
          </a>
        )}
      </div>

      <button
        type="submit"
        className="nm-btn"
        style={{
          width: "100%",
          padding: "16px",
          fontSize: 14,
          background: "var(--nm-primary)",
          color: "#fff",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        Login →
      </button>

      <div style={{ display: "flex", alignItems: "center", margin: "2rem 0" }}>
        <div
          style={{ flex: 1, height: "4px", background: "var(--nm-ink)", opacity: 0.1 }}
        />
        <span
          style={{
            padding: "0 16px",
            fontFamily: "var(--font-display)",
            fontSize: 12,
            fontWeight: 800,
            color: "var(--nm-text-tertiary)",
            letterSpacing: "0.1em",
          }}
        >
          OR
        </span>
        <div
          style={{ flex: 1, height: "4px", background: "var(--nm-ink)", opacity: 0.1 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <div
          style={{
            display: "inline-flex",
            border: "4px solid var(--nm-ink)",
            boxShadow: "6px 6px 0 var(--nm-ink)",
            background: "#fff",
            borderRadius: "0px",
            overflow: "hidden",
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMsg("Google login failed.")}
            theme="outline"
            size="large"
            text="continue_with"
          />
        </div>
      </div>
    </form>
  );
}
