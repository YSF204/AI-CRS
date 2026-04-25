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
  const bgColor = isSuccess ? "var(--nm-success)" : "var(--nm-error)";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 20px",
        borderRadius: "8px",
        background: bgColor,
        color: "white",
        fontWeight: 500,
        fontSize: "14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        animation: "toast-fade-in 300ms ease-out",
      }}
    >
      {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{toast.msg}</span>
      <style>{`
        @keyframes toast-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toast-fade-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(10px);
          }
        }
      `}</style>
    </div>
  );
}
