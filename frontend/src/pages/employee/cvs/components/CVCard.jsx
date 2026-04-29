import { Edit, Trash2 } from "lucide-react";
import CVPreviewCard from "../../../../components/employee/ats-score/CVPreviewCard";

export default function CVCard({ cv, onEdit, onDelete }) {
  return (
    <div className="relative group flex flex-col">
      <CVPreviewCard
        cv={{ ...cv, buttonText: "EDIT RESUME" }}
        onAnalyze={() => onEdit(cv._id)}
      />

      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(cv._id);
          }}
          className="w-8 h-8 flex items-center justify-center bg-[var(--nm-primary)] text-white border-4 border-[var(--nm-ink)] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
          title="Edit CV"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cv._id);
          }}
          className="w-8 h-8 flex items-center justify-center bg-[var(--nm-error)] text-white border-4 border-[var(--nm-ink)] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
          title="Delete CV"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
