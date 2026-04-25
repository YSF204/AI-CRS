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
        gap: "12px",
        padding: "12px 20px",
        borderRadius: "8px",
        background: bgColor,
        color: "white",
        fontWeight: 500,
        fontSize: "14px",
        minWidth: "240px",
        maxWidth: "360px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        animation: "toast-slide-in 300ms ease-out",
      }}
    >
      {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{toast.msg}</span>
      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
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