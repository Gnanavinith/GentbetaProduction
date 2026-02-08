import { Factory, Plus, Settings } from "lucide-react";
import PlantsSection from "../../components/company/PlantsSection";

export default function CompanyPlantsSection({ 
  company,
  updatingTemplateFeature,
  handleTogglePlantTemplateFeature,
  isTemplateFeatureEnabled,
  navigate,
  id
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Factory size={14} />
          Facilities & Plants
        </h3>
        <button
          onClick={() => navigate(`/super/companies/${id}/plants/add`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-bold"
        >
          <Plus size={12} />
          Add Plant
        </button>
      </div>
      
      <PlantsSection 
        company={company}
        updatingTemplateFeature={updatingTemplateFeature}
        handleTogglePlantTemplateFeature={handleTogglePlantTemplateFeature}
        isTemplateFeatureEnabled={isTemplateFeatureEnabled}
        navigate={navigate}
        id={id}
      />
    </div>
  );
}