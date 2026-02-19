import ModernFacilityBuilder from "../../components/forms/ModernFormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function FacilityBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/plant/forms")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-semibold group"
        >
          <div className="p-1.5 bg-white border border-slate-200 rounded-lg group-hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Facilitys
        </button>
      </div>

      <ModernFacilityBuilder formId={id} />
    </div>
  );
}
