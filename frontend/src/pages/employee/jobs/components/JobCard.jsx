import React from "react";
import { Sparkles } from "lucide-react";

export default function JobCard({ stats }) {
  return (
    <div className="jd-hero mb-6 lg:mb-8 space-y-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-4">
          <span className="jd-hero-label">
            <Sparkles size={14} />
            Job Discovery
          </span>
          <h1 className="jd-hero-title text-4xl lg:text-5xl font-bold">
            Find jobs with structure.
          </h1>
          <p className="jd-hero-copy text-sm">
            Browse open roles or match them to a CV. The layout is tuned for
            fast scanning, sharp hierarchy, and direct action.
          </p>
        </div>

        <div className="hidden xl:block jd-surface-stack min-w-0 xl:max-w-md">
          <p className="jd-section-title mb-3">At a glance</p>
          <div className="jd-meta-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="jd-stat-card">
                <p className="jd-stat-label">{stat.label}</p>
                <p className="jd-stat-value">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
