import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResultScreen({ matchAnalysis, navigate, onClose }) {
  const nav = useNavigate();
  const go = (path) => {
    if (navigate) {
      navigate(path);
    } else {
      nav(path);
    }
    if (onClose) onClose();
  };
  const isSuccess = matchAnalysis.applicationSuccess || (matchAnalysis.matchPercentage ?? 0) >= 50;

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-lg mx-auto text-[var(--fg)]">
      {isSuccess ? (
        <>
          <div className="flex items-center justify-center bg-[var(--teal)] p-6 border-4 border-black shadow-[6px_6px_0px_#000]">
            <CheckCircle size={64} className="text-black" />
          </div>
          <h2 className="text-3xl font-black font-['Space_Grotesk'] uppercase text-center mt-2">
            Action Completed!
          </h2>
          <p className="font-mono text-base font-bold text-[var(--fg-muted)] text-center px-4">
            {matchAnalysis.applicationMessage || "Your application record has been processed successfully."}
          </p>
          {matchAnalysis.matchPercentage !== null && matchAnalysis.matchPercentage !== undefined && (
            <div className="flex flex-col items-center border-[4px] border-black p-4 bg-white mt-2">
              <span className="font-mono text-xs uppercase font-bold text-black mb-1">AI Assessed Match</span>
              <span className="text-4xl font-black text-black">
                {`${matchAnalysis.matchPercentage}%`}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-center bg-[var(--coral)] p-6 border-4 border-black shadow-[6px_6px_0px_#000]">
            <AlertCircle size={64} className="text-black" />
          </div>
          <h2 className="text-3xl font-black font-['Space_Grotesk'] uppercase text-center mt-2">
            Action Failed
          </h2>
          <p className="font-mono text-base font-bold text-black text-center px-4">
            Your match percentage is {matchAnalysis.matchPercentage}%, which caused evaluating concerns.
          </p>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full mt-6">
        <button
          onClick={() => go(`/employee/jobs`)}
          className="flex-1 brutal-btn px-6 py-4 font-black uppercase text-sm border-4 border-black flex items-center justify-center"
          style={{ background: "#fff", color: "#000" }}
        >
          View More Jobs
        </button>
        {isSuccess && (
          <button
            onClick={() => go("/employee/applications")}
            className="flex-1 brutal-btn px-6 py-4 bg-[var(--yellow)] font-black uppercase text-sm border-4 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center shadow-[4px_4px_0px_#000]"
          >
            My Applications
          </button>
        )}
      </div>
    </div>
  );
}
