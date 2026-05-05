import React from "react";

const defaultCls = "sk";

export function SkBox({ w, h, className = "", style = {} }) {
  return (
    <div
      className={`${defaultCls} ${className}`}
      style={{ width: w, height: h, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkText({ lines = 1, w = "100%", gap, className = "", style = {} }) {
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: gap ?? "var(--spacing-2)", ...style }}
      aria-hidden="true"
    >
      {Array.from({ length: lines }, (_, i) => {
        const last = i === lines - 1 && lines > 1;
        const lw = last && typeof w === "string" && w === "100%" ? "60%" : w;
        return (
          <div
            key={i}
            className={defaultCls}
            style={{ width: lw, height: "var(--text-base, 16px)" }}
          />
        );
      })}
    </div>
  );
}

export function SkCard({ className = "", style = {}, children }) {
  return (
    <div
      className={`sk-card ${className}`}
      style={style}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export function SkAvatar({ size = 40, className = "" }) {
  return (
    <div
      className={`${defaultCls} ${className}`}
      style={{ width: size, height: size, flexShrink: 0 }}
      aria-hidden="true"
    />
  );
}

export function SkStatCard({ className = "" }) {
  return (
    <SkCard className={className} style={{ height: 160 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-3)" }}>
        <SkBox w={48} h={48} />
      </div>
      <SkBox w="60%" h={28} />
      <div style={{ marginTop: "var(--spacing-2)" }}>
        <SkBox w="40%" h={14} />
      </div>
    </SkCard>
  );
}

export function SkTableRow({ cols = 5, className = "" }) {
  return (
    <div
      className={`sk-row ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: cols }, (_, i) => (
        <SkBox key={i} w={i === 0 ? "30%" : i === cols - 1 ? "20%" : "15%"} h={16} />
      ))}
    </div>
  );
}

export function SkTable({ rows = 5, cols = 5, className = "" }) {
  return (
    <div className={`sk-table ${className}`} aria-hidden="true">
      <div className="sk-row sk-row-head">
        {Array.from({ length: cols }, (_, i) => (
          <SkBox key={i} w={i === 0 ? "30%" : "15%"} h={14} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <SkTableRow key={i} cols={cols} />
      ))}
    </div>
  );
}

export function SkCardGrid({ count = 3, height = 400, className = "" }) {
  return (
    <div className={`sk-card-grid ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <SkCard key={i} style={{ height }} />
      ))}
    </div>
  );
}

export function SkWidget({ className = "" }) {
  return (
    <SkCard className={className} style={{ minHeight: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-4)" }}>
        <div>
          <SkBox w={80} h={12} />
          <SkBox w={140} h={24} style={{ marginTop: "var(--spacing-1)" }} />
        </div>
        <SkBox w={40} h={40} />
      </div>
      <SkText lines={3} />
    </SkCard>
  );
}
