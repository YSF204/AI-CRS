import React from "react";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../../../context/LanguageContext";

export default function RecentActivity({ priorityWorkflows }) {
  const { t } = useTranslation();
  if (priorityWorkflows.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle size={20} className="text-[var(--color-warning)]" />
        <h2 className="text-body-lg font-semibold text-[var(--text-primary)]">
          {t("employeeDashboard.priorityActions")}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {priorityWorkflows.map((workflow, index) => {
          const Icon = workflow.icon;
          return (
            <Link
              key={index}
              to={workflow.href}
              className="workflow-card p-6 bg-[var(--card-bg)] flex flex-col gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-lg shrink-0 border-2"
                  style={{
                    background: workflow.color,
                    borderColor: "var(--text-primary)",
                  }}
                >
                  <Icon
                    size={24}
                    color={workflow.iconColor || "var(--text-primary)"}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-body font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {workflow.label}
                    </h3>
                    {workflow.priority === "high" && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white rounded"
                        style={{ background: "var(--color-danger)" }}
                      >
                        {t("employeeDashboard.high")}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-[var(--text-muted)] leading-relaxed">
                    {workflow.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-mono text-xs text-[var(--color-primary)] font-medium">
                <span>{t("employeeDashboard.takeAction")}</span>
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
