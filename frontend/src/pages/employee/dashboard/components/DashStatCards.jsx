import React from "react";
import { TrendingUp } from "lucide-react";

export default function DashStatCards({ kpiData }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp size={20} className="text-[var(--color-primary)]" />
        <h2 className="text-body-lg font-semibold text-[var(--text-primary)]">
          Your Progress
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="kpi-card">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-lg"
                  style={{ background: `${kpi.color}20` }}
                >
                  <Icon size={20} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-display-lg text-[var(--text-primary)] mb-1">
                {kpi.value}
              </p>
              <p className="text-body-sm text-[var(--text-muted)] mb-2">
                {kpi.label}
              </p>
              <p className="text-mono text-xs text-[var(--text-tertiary)]">
                {kpi.change}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
