import React from "react";
import { 
  Crown, 
  Plus 
} from "lucide-react";

export function PlanSelector({ 
  plans, 
  selectedPlan, 
  setSelectedPlan, 
  customLimits, 
  setIsCustomModalOpen 
}) {
  const getPlanIcon = (planKey) => {
    switch(planKey) {
      case "GOLD": return "🥇";
      case "PREMIUM": return "💎";
      default: return "🥈";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md">
      <div className="h-1.5 bg-amber-500" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Crown className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Subscription Plan</h2>
            <p className="text-sm text-slate-500">Select plan for this company.</p>
          </div>
        </div>

        <div className="space-y-3">
          {plans.filter(p => p.key !== "CUSTOM").map((plan) => (
            <label 
              key={plan.key}
              className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === plan.key 
                  ? "border-indigo-500 bg-indigo-50/50" 
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="plan"
                  value={plan.key}
                  checked={selectedPlan === plan.key}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.key ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                }`}>
                  {selectedPlan === plan.key && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getPlanIcon(plan.key)}
                    </span>
                    <span className="font-bold text-slate-900">{plan.name}</span>
                    {plan.popular && (
                      <span className="text-[10px] uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Popular</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">
                    {plan.limits.maxPlants === -1 ? "∞" : plan.limits.maxPlants}
                  </div>
                  <div className="text-slate-500">Plants</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    {plan.limits.maxFormsPerPlant === -1 ? "∞" : plan.limits.maxFormsPerPlant}
                  </div>
                  <div className="text-slate-500">Forms</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    {plan.limits.maxEmployeesPerPlant === -1 ? "∞" : plan.limits.maxEmployeesPerPlant}
                  </div>
                  <div className="text-slate-500">Employees</div>
                </div>
              </div>
            </label>
          ))}

          {/* Custom Plan Option */}
          <div className="pt-2">
            {selectedPlan === "CUSTOM" ? (
              <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/50 shadow-sm animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <span className="font-bold text-slate-900">Custom Plan</span>
                    <span className="text-[10px] uppercase bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Active</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsCustomModalOpen(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                  >
                    Edit Limits
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-white/50 rounded-lg p-2 border border-indigo-100">
                    <div className="font-bold text-slate-900">{customLimits.maxPlants}</div>
                    <div className="text-slate-500 uppercase">Plants</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2 border border-indigo-100">
                    <div className="font-bold text-slate-900">{customLimits.maxFormsPerPlant}</div>
                    <div className="text-slate-500 uppercase">Forms</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2 border border-indigo-100">
                    <div className="font-bold text-slate-900">{customLimits.maxEmployeesPerPlant}</div>
                    <div className="text-slate-500 uppercase">Users</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedPlan("SILVER")}
                  className="w-full mt-3 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Switch to Predefined Plan
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  setSelectedPlan("CUSTOM");
                  setIsCustomModalOpen(true);
                }}
                className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="flex items-center justify-center gap-2 text-slate-500 group-hover:text-indigo-600">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-bold">Customize Plan</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Create tailored limits for this entity</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
