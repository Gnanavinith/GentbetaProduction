import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { getAllPlans } from "../../config/plans";
import CustomPlanModal from "../../components/modals/CustomPlanModal";
import CompanyInfoStep from "./CompanyInfoStep";
import CompanyAdminStep from "./CompanyAdminStep";
import PlantSetupStep from "./PlantSetupStep";
import AdminSetupStep from "./AdminSetupStep";
import PlanSelectionStep from "./PlanSelectionStep";
import ReviewSubmitStep from "./ReviewSubmitStep";

export default function CreateCompanyWizard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const PLANS = getAllPlans();

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("SILVER");
  const [customLimits, setCustomLimits] = useState({
    maxPlants: 1,
    maxFormsPerPlant: 10,
    maxEmployeesPerPlant: 20,
    approvalLevels: 3
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [company, setCompany] = useState({
    companyName: "",
    industry: "",
    contactEmail: "",
    address: "",
    gstNumber: "",
    logoUrl: "",
  });

  const [plants, setPlants] = useState([
    { 
      plantName: "", 
      location: "", 
      plantNumber: "",
      adminName: "",
      adminEmail: "",
      adminPassword: ""
    }
  ]);

  const [companyAdmin, setCompanyAdmin] = useState({
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!token) return;
    
    const toastId = toast.loading("Creating company...");
    try {
      setLoading(true);
      
      // Log the payload for debugging
      const payload = {
        company: {
          companyName: company.companyName,
          industry: company.industry,
          contactEmail: company.contactEmail,
          address: company.address,
          gstNumber: company.gstNumber,
          logoUrl: company.logoUrl,
        },
        plants: plants.map(plant => ({
          name: plant.plantName,
          location: plant.location,
          plantNumber: plant.plantNumber || undefined,
          adminName: plant.adminName || plant.adminEmail.split('@')[0],
          adminEmail: plant.adminEmail,
          adminPassword: plant.adminPassword,
        })),
        admin: {
          name: companyAdmin.adminName,
          email: companyAdmin.adminEmail,
          password: companyAdmin.adminPassword
        },
        plan: selectedPlan,
        customLimits: selectedPlan === "CUSTOM" ? customLimits : undefined
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));
      
      await api.post("/api/companies/create-with-plants-admin", payload);
      toast.success("Company created successfully!", { id: toastId });
      navigate("/super/companies");
    } catch (err) {
      console.error("Create company error:", err);
      toast.error(err.response?.data?.message || "Failed to create company", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <CompanyInfoStep
            company={company}
            setCompany={setCompany}
            onNext={handleNext}
            isLastStep={step === totalSteps}
          />
        );
      case 2:
        return (
          <CompanyAdminStep
            companyAdmin={companyAdmin}
            setCompanyAdmin={setCompanyAdmin}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLastStep={step === totalSteps}
          />
        );
      case 3:
        return (
          <PlantSetupStep
            plants={plants}
            setPlants={setPlants}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLastStep={step === totalSteps}
          />
        );
      case 4:
        return (
          <AdminSetupStep
            plants={plants}
            setPlants={setPlants}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLastStep={step === totalSteps}
          />
        );
      case 5:
        return (
          <PlanSelectionStep
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            customLimits={customLimits}
            setCustomLimits={setCustomLimits}
            setIsCustomModalOpen={setIsCustomModalOpen}
            plans={PLANS}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLastStep={step === totalSteps}
          />
        );
      case 6:
        return (
          <ReviewSubmitStep
            company={company}
            companyAdmin={companyAdmin}
            plants={plants}
            selectedPlan={selectedPlan}
            customLimits={customLimits}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="w-full px-6 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/super/companies")}
              className="group flex items-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all gap-2.5"
            >
              <div className="p-2 rounded-xl group-hover:bg-indigo-50 transition-all group-hover:shadow-sm">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              Back to Companies
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === num 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : step > num 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step > num ? <CheckCircle2 size={16} /> : num}
                  </div>
                  {num < 5 && (
                    <div className={`w-8 h-0.5 mx-1 transition-all ${
                      step > num ? 'bg-green-500' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">Step {step} of {totalSteps}</p>
              <p className="text-xs text-slate-500">Company Setup Wizard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>
      </div>

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