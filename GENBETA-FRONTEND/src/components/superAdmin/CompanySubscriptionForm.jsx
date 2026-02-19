import { Crown, Zap, Star, Medal, Sparkles } from "lucide-react";

export default function CompanySubscriptionFacility({ company }) {
  const getPlanIcon = (planKey) => {
    switch(planKey?.toUpperCase()) {
      case "GOLD": return <Medal className="w-5 h-5 text-amber-500" />;
      case "PREMIUM": return <Crown className="w-5 h-5 text-purple-500" />;
      case "CUSTOM": return <Sparkles className="w-5 h-5 text-blue-500" />;
      default: return <Star className="w-5 h-5 text-slate-400" />;
    }
  };

  const plan = company.subscription?.plan || "SILVER";
  const planIcon = getPlanIcon(plan);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-600" />
          Subscription Plan
        </h2>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">{planIcon}</div>
          <div>
            <h3 className="font-bold text-xl text-slate-900">{plan} Plan</h3>
            <p className="text-sm text-slate-600">
              {plan === "CUSTOM" 
                ? "Custom configured limits" 
                : "Standard plan limits"
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
            <div className="text-2xl font-black text-indigo-600 mb-1">
              {company.subscription?.customLimits?.maxPlants === -1 ? '∞' : (company.subscription?.customLimits?.maxPlants || 1)}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plants</div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
            <div className="text-2xl font-black text-green-600 mb-1">
              {company.subscription?.customLimits?.maxFacilitysPerPlant === -1 ? '∞' : (company.subscription?.customLimits?.maxFacilitysPerPlant || 10)}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facilitys/Plant</div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
            <div className="text-2xl font-black text-blue-600 mb-1">
              {company.subscription?.customLimits?.maxEmployeesPerPlant === -1 ? '∞' : (company.subscription?.customLimits?.maxEmployeesPerPlant || 20)}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employees/Plant</div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
            <div className="text-2xl font-black text-amber-600 mb-1">
              {company.subscription?.customLimits?.approvalLevels === -1 ? '∞' : (company.subscription?.customLimits?.approvalLevels || 3)}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approval Levels</div>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Plan Management</p>
              <p className="text-xs text-amber-600 mt-1">
                To change the subscription plan or modify limits, please use the company detail page's plan management section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}