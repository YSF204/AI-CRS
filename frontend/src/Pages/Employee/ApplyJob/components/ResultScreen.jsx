import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ResultScreen({ matchAnalysis, navigate }) {
  const isSuccess = matchAnalysis.applicationSuccess || matchAnalysis.matchPercentage >= 50;

  return (
    <div className="flex-1 flex items-center justify-center px-8">
      <div className="brutal-card bg-[var(--card-bg)] p-8 max-w-md w-full">
        {isSuccess ? (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle size={48} className="text-[var(--teal)]" />
            </div>
            <h2 className="text-xl font-bold font-['Space_Grotesk'] uppercase text-center mb-4">
              Application Submitted!
            </h2>
            <p className="font-mono text-sm text-[var(--fg-muted)] text-center mb-4">
              {matchAnalysis.applicationMessage || "Your application has been submitted successfully"}
            </p>
            <p className="text-2xl font-bold text-center mb-6" style={{ color: "var(--yellow)" }}>
              {matchAnalysis.matchPercentage}% Match
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <AlertCircle size={48} className="text-[var(--coral)]" />
            </div>
            <h2 className="text-xl font-bold font-['Space_Grotesk'] uppercase text-center mb-4">
              Application Denied
            </h2>
            <p className="font-mono text-sm text-[var(--fg-muted)] text-center mb-4">
              Your match percentage is {matchAnalysis.matchPercentage}%, which is below the required 50% threshold.
            </p>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/employee/jobs`)}
            className="flex-1 brutal-btn px-4 py-2 font-bold"
            style={{ background: "var(--teal)", color: "#0a0a0a" }}
          >
            Back to Jobs
          </button>
          {isSuccess && (
            <button
              onClick={() => navigate("/employee/applications")}
              className="flex-1 brutal-btn px-4 py-2 font-bold"
              style={{ background: "var(--yellow)", color: "#0a0a0a" }}
            >
              My Applications
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
