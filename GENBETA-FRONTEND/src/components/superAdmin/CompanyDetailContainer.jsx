import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { companyApi } from "../../api/company.api";
import { plantApi } from "../../api/plant.api";
import { toast } from "react-hot-toast";
import { ArrowLeft, Edit3, Plus, AlertCircle } from "lucide-react";
import CompanyOverviewSection from "./CompanyOverviewSection";
import CompanyStatsSection from "./CompanyStatsSection";
import CompanyAdminsSection from "./CompanyAdminsSection";
import CompanyPlantsSection from "./CompanyPlantsSection";
import CompanySettingsSection from "./CompanySettingsSection";
import CustomPlanModal from "../../components/modals/CustomPlanModal";
import PlanModal from "../../components/modals/PlanModal";
import OverLimitWarningBanner from "../../components/common/OverLimitWarningBanner";

export default function CompanyDetailContainer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [customLimits, setCustomLimits] = useState({
    maxPlants: 1,
    maxFormsPerPlant: 1,
    maxEmployeesPerPlant: 1,
    approvalLevels: 1
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [updatingTemplateFeature, setUpdatingTemplateFeature] = useState(false);
  const [showOverLimitWarning, setShowOverLimitWarning] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCompany();
  }, [id, token]);

  const fetchCompany = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await companyApi.getCompanyById(id);
      setCompany(data);
      const plan = data.subscription?.plan || "SILVER";
      setSelectedPlan(plan);
      if (plan === "CUSTOM" && data.subscription?.customLimits) {
        setCustomLimits(data.subscription.customLimits);
      }
      // Show over limit warning if company is over limits
      if (data.isOverLimit && showOverLimitWarning) {
        setShowOverLimitWarning(true);
      }
    } catch (err) {
      setError(err?.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpdate = async () => {
    try {
      setUpdatingPlan(true);
      const payload = { 
        plan: selectedPlan,
        customLimits: selectedPlan === "CUSTOM" ? customLimits : undefined
      };
      const response = await companyApi.updatePlan(id, payload.plan, payload.customLimits);
      toast.success(`Plan updated to ${selectedPlan} successfully`);
      
      // Update company data with new usage details
      if (response.usageDetails) {
        setCompany(prev => ({
          ...prev,
          ...response.usageDetails
        }));
      } else {
        await fetchCompany();
      }
      
      setIsPlanModalOpen(false);
      setShowOverLimitWarning(false); // Hide warning after successful upgrade
    } catch (err) {
      console.error("Plan update error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update plan");
      setError(err?.message || "Failed to update plan");
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleToggleCompanyTemplateFeature = async (enabled) => {
    try {
      setUpdatingTemplateFeature(true);
      const response = await companyApi.updateTemplateFeature(company._id, enabled);
      if (response.success) {
        toast.success(`Template feature ${enabled ? 'enabled' : 'disabled'} for company`);
        await fetchCompany();
      } else {
        toast.error(response.message || "Failed to update template feature");
      }
    } catch (err) {
      console.error("Toggle template feature error:", err);
      toast.error(err.response?.data?.message || "Failed to update template feature");
    } finally {
      setUpdatingTemplateFeature(false);
    }
  };

  const handleTogglePlantTemplateFeature = async (plantId, enabled) => {
    try {
      setUpdatingTemplateFeature(true);
      const response = await plantApi.updateTemplateFeature(plantId, enabled);
      if (response.success) {
        toast.success(`Template feature ${enabled ? 'enabled' : 'disabled'} for plant`);
        await fetchCompany();
      } else {
        toast.error(response.message || "Failed to update template feature");
      }
    } catch (err) {
      console.error("Toggle plant template feature error:", err);
      toast.error(err.response?.data?.message || "Failed to update template feature");
    } finally {
      setUpdatingTemplateFeature(false);
    }
  };

  const isTemplateFeatureEnabled = (plant) => {
    if (plant.templateFeatureEnabled !== null && plant.templateFeatureEnabled !== undefined) {
      return plant.templateFeatureEnabled;
    }
    return company?.templateFeatureEnabled || false;
  };

  const getPlanIcon = (planKey) => {
    switch(planKey?.toUpperCase()) {
      case "GOLD": return "🥇";
      case "PREMIUM": return "💎";
      case "CUSTOM": return "✨";
      default: return "🥈";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error || "Company not found"}</p>
          <button
            onClick={() => navigate("/super/companies")}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all font-semibold"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      {/* Sticky Action Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm -mx-6 -mt-6 mb-8">
        <div className="max-w-full mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate("/super/companies")}
            className="flex items-center text-slate-600 hover:text-indigo-600 transition-all font-semibold gap-2.5 group"
          >
            <div className="p-2 rounded-xl group-hover:bg-indigo-50 transition-all group-hover:shadow-sm">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm">Back to Directory</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/super/companies/${id}/edit`)}
              className="flex items-center gap-2 px-5 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-sm shadow-sm hover:shadow"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
            <button
              onClick={() => navigate(`/super/companies/${id}/plants/add`)}
              className="flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <Plus size={16} />
              New Plant
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-2">
        <OverLimitWarningBanner
          isOverLimit={company?.isOverLimit && showOverLimitWarning}
          overLimitDetails={company?.overLimitDetails}
          onUpgradeClick={() => setIsPlanModalOpen(true)}
          onClose={() => setShowOverLimitWarning(false)}
        />
        <CompanyOverviewSection company={company} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1 space-y-6">
            <CompanyStatsSection company={company} />
            <CompanyAdminsSection company={company} />
            <CompanySettingsSection 
              company={company} 
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              setPlanModalOpen={setIsPlanModalOpen}
              getPlanIcon={getPlanIcon}
              handleToggleCompanyTemplateFeature={handleToggleCompanyTemplateFeature}
              updatingTemplateFeature={updatingTemplateFeature}
            />
          </div>
          
          <div className="lg:col-span-2">
            <CompanyPlantsSection 
              company={company}
              updatingTemplateFeature={updatingTemplateFeature}
              handleTogglePlantTemplateFeature={handleTogglePlantTemplateFeature}
              isTemplateFeatureEnabled={isTemplateFeatureEnabled}
              navigate={navigate}
              id={id}
            />
          </div>
        </div>
      </main>

      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        customLimits={customLimits}
        setCustomLimits={setCustomLimits}
        setIsCustomModalOpen={setIsCustomModalOpen}
        onUpdatePlan={handlePlanUpdate}
        updatingPlan={updatingPlan}
      />
      
      <CustomPlanModal 
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        limits={customLimits}
        onSave={(newLimits) => {
          setCustomLimits(newLimits);
          setSelectedPlan("CUSTOM");
        }}
      />
    </div>
  );
}