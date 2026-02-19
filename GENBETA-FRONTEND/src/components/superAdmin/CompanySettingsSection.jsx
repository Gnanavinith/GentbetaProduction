import { Crown, Shield, Sparkles, Check } from "lucide-react";
import TemplateFeatureCard from "../../components/company/TemplateFeatureCard";
import SubscriptionPlanCard from "../../components/company/SubscriptionPlanCard";

export default function CompanySettingsSection({ 
  company, 
  selectedPlan,
  setSelectedPlan,
  setPlanModalOpen,
  getPlanIcon,
  handleToggleCompanyTemplateFeature,
  updatingTemplateFeature
}) {
  return (
    <div className="space-y-6">
      <TemplateFeatureCard 
        company={company} 
        handleToggleCompanyTemplateFeature={handleToggleCompanyTemplateFeature} 
        updatingTemplateFeature={updatingTemplateFeature} 
      />
      
      <SubscriptionPlanCard 
        company={company} 
        PLANS={getAllPlans()} 
        setPlanModalOpen={setPlanModalOpen} 
        getPlanIcon={getPlanIcon} 
      />
    </div>
  );
}

// Helper function to get plans (this should be imported from config)
function getAllPlans() {
  return [
    { key: "SILVER", name: "Silver", description: "Basic plan for small businesses", limits: { maxPlants: 1, maxFormsPerPlant: 10, maxEmployeesPerPlant: 20, approvalLevels: 3 } },
    { key: "GOLD", name: "Gold", description: "Professional plan for growing businesses", limits: { maxPlants: 5, maxFormsPerPlant: 50, maxEmployeesPerPlant: 100, approvalLevels: 5 } },
    { key: "PREMIUM", name: "Premium", description: "Enterprise plan with advanced features", limits: { maxPlants: -1, maxFormsPerPlant: -1, maxEmployeesPerPlant: -1, approvalLevels: -1 } },
    { key: "CUSTOM", name: "Custom", description: "Tailored solution for specific needs", limits: { maxPlants: 1, maxFormsPerPlant: 1, maxEmployeesPerPlant: 1, approvalLevels: 1 } }
  ];
}