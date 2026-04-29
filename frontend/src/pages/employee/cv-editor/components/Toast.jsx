import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Toast({ toast }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!toast) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast || !isVisible) return null;

  const isSuccess = toast.type === "success";
  const bgColor = isSuccess ? "#16a34a" : "#dc2626";

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 24px",
        background: isSuccess ? "var(--nm-success-surface)" : "var(--nm-error-surface)",
        color: isSuccess ? "var(--nm-success)" : "var(--nm-error)",
        border: `4px solid ${isSuccess ? "var(--nm-success)" : "var(--nm-error)"}`,
        boxShadow: `6px 6px 0 ${isSuccess ? "var(--nm-success)" : "var(--nm-error)"}`,
        borderRadius: "0px",
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: "0.9rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        minWidth: "280px",
        maxWidth: "420px",
        animation: "toast-slide-in 350ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
    >
      {isSuccess ? (
        <CheckCircle size={22} strokeWidth={2.5} />
      ) : (
        <AlertCircle size={22} strokeWidth={2.5} />
      )}
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}