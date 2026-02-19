import { FaCrown as Crown, FaBolt as Zap, FaStar as Star, FaMagic as Sparkles, FaCog as Settings, FaMedal as Medal, FaGem as Gem, FaSlidersH as Sliders } from "react-icons/fa";

export default function PlanSelectionStep({ 
  selectedPlan, 
  setSelectedPlan, 
  customLimits, 
  setCustomLimits, 
  setIsCustomModalOpen,
  plans,
  onNext,
  onPrevious
}) {
  const getPlanIcon = (planKey) => {
    switch(planKey?.toUpperCase()) {
      case "GOLD": return <Medal size={24} className="mx-auto text-amber-500" />;
      case "PREMIUM": return <Gem size={24} className="mx-auto text-purple-500" />;
      case "CUSTOM": return <Sliders size={24} className="mx-auto text-blue-500" />;
      default: return <Star size={24} className="mx-auto text-slate-500" />;
    }
  };

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    if (planKey === "CUSTOM") {
      setIsCustomModalOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 px-8 md:px-10 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <Crown className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Subscription Plan</h2>
            <p className="text-sm text-slate-600">Choose the perfect plan for your company</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.key}
              onClick={() => handlePlanSelect(plan.key)}
              className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                selectedPlan === plan.key
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{getPlanIcon(plan.key)}</div>
                <h3 className="font-black text-lg text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-600 mb-4 min-h-[40px]">{plan.description}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plants:</span>
                    <span className="font-bold">{plan.limits.maxPlants === -1 ? '∞ Unlimited' : plan.limits.maxPlants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Forms per Plant:</span>
                    <span className="font-bold">{plan.limits.maxFormsPerPlant === -1 ? '∞ Unlimited' : plan.limits.maxFormsPerPlant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employees per Plant:</span>
                    <span className="font-bold">{plan.limits.maxEmployeesPerPlant === -1 ? '∞ Unlimited' : plan.limits.maxEmployeesPerPlant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approval Levels:</span>
                    <span className="font-bold">{plan.limits.approvalLevels === -1 ? '∞ Unlimited' : plan.limits.approvalLevels}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 mb-2">Need Something Different?</h4>
              <p className="text-sm text-amber-700">
                Don't see a plan that fits your needs? Our Custom plan lets you define exactly what works for your organization. 
                Click on the Custom plan above to configure your specific requirements.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 via-amber-50/30 to-slate-50 px-8 md:px-10 py-6 border-t-2 border-slate-200">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
          >
            Previous
          </button>
          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 text-white rounded-xl font-bold hover:from-amber-700 hover:via-amber-800 hover:to-yellow-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Next: Review & Submit
          </button>
        </div>
      </div>
    </div>
  );
}