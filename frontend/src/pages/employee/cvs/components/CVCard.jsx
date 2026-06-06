import { Edit, Trash2 } from "lucide-react";
import CVPreviewCard from "../../../../components/employee/ats-score/CVPreviewCard";
import { useTranslation } from "../../../../context/LanguageContext";

export default function CVCard({ cv, onEdit, onDelete }) {
  const { t } = useTranslation();

  return (
    <div className="cvs-card flex flex-col">
      <CVPreviewCard cv={cv} />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          onClick={() => onEdit(cv._id)}
          className="nm-btn nm-btn-primary"
          style={{ padding: "10px 12px", fontSize: "12px" }}
        >
          <Edit size={14} strokeWidth={2.5} /> {t('employee.edit')}
        </button>
        <button
          onClick={() => onDelete(cv._id)}
          className="nm-btn"
          style={{
            padding: "10px 12px",
            fontSize: "12px",
            background: "var(--nm-error)",
            color: "#fff",
          }}
        >
          <Trash2 size={14} strokeWidth={2.5} /> {t('employee.delete')}
        </button>
      </div>
    </div>
  );
}
