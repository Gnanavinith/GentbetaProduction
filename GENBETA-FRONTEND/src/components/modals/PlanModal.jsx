import React from 'react';
import { X, Crown, Check, Star, Zap, Sparkles } from 'lucide-react';

export default function PlanModal({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  setSelectedPlan, 
  customLimits, 
  setCustomLimits,
  setIsCustomModalOpen,
  onUpdatePlan,
  updatingPlan
}) {
  const plans = [
    { 
      key: "SILVER", 
      name: "Silver", 
      description: "Basic plan for small businesses",
      icon: "🥈",
      limits: { maxPlants: 1, maxFormsPerPlant: 10, maxEmployeesPerPlant: 20, approvalLevels: 3 },
      color: "from-gray-400 to-gray-500"
    },
    { 
      key: "GOLD", 
      name: "Gold", 
      description: "Professional plan for growing businesses",
      icon: "🥇",
      limits: { maxPlants: 5, maxFormsPerPlant: 50, maxEmployeesPerPlant: 100, approvalLevels: 5 },
      color: "from-amber-400 to-amber-500"
    },
    { 
      key: "PREMIUM", 
      name: "Premium", 
      description: "Enterprise plan with advanced features",
      icon: "💎",
      limits: { maxPlants: -1, maxFormsPerPlant: -1, maxEmployeesPerPlant: -1, approvalLevels: -1 },
      color: "from-purple-500 to-purple-600"
    },
    { 
      key: "CUSTOM", 
      name: "Custom", 
      description: "Tailored solution for specific needs",
      icon: "✨",
      limits: customLimits,
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    if (planKey === "CUSTOM") {
      setIsCustomModalOpen(true);
    }
  };

  const handleUpdate = async () => {
    await onUpdatePlan();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Change Subscription Plan</h2>
                <p className="text-indigo-100 text-sm">Select a new plan for this company</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.key}
                onClick={() => handlePlanSelect(plan.key)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                  selectedPlan === plan.key
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                {selectedPlan === plan.key && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{plan.icon}</div>
                  <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-lg font-black text-slate-900">
                        {plan.limits.maxPlants === -1 ? '∞' : plan.limits.maxPlants}
                      </div>
                      <div className="text-xs text-slate-500 uppercase font-bold">Plants</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-lg font-black text-slate-900">
                        {plan.limits.maxFormsPerPlant === -1 ? '∞' : plan.limits.maxFormsPerPlant}
                      </div>
                      <div className="text-xs text-slate-500 uppercase font-bold">Forms/Plant</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-lg font-black text-slate-900">
                        {plan.limits.maxEmployeesPerPlant === -1 ? '∞' : plan.limits.maxEmployeesPerPlant}
                      </div>
                      <div className="text-xs text-slate-500 uppercase font-bold">Users/Plant</div>
                    </div>
                  </div>
                </div>

                {plan.key === "CUSTOM" && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCustomModalOpen(true);
                      }}
                      className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Customize Limits
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={updatingPlan}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updatingPlan}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updatingPlan ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" />
                Update Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}