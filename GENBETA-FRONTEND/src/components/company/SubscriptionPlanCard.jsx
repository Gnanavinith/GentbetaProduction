import { Crown } from "lucide-react";

export default function SubscriptionPlanCard({ company, PLANS, setPlanModalOpen, getPlanIcon }) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-xl shadow-indigo-500/40 p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
      <div className="relative">
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-90 flex items-center gap-2">
            <Crown size={14} />
            Subscription Plan
          </h3>
          <button
            onClick={() => setPlanModalOpen(true)}
            className="text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
          >
            Change Plan
          </button>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            {getPlanIcon(company.subscription?.plan)}
          </div>
          <div>
            <h4 className="text-3xl font-black capitalize mb-1">{company.subscription?.plan || "Silver"}</h4>
            <p className="text-sm text-white/80 font-semibold">Manual Billing</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-inner">
          {(() => {
            if (company.subscription?.plan === "CUSTOM" && company.subscription?.customLimits) {
              const cl = company.subscription.customLimits;
              return (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-black mb-1">{cl.maxPlants}</div>
                    <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Plants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black mb-1">{cl.maxFormsPerPlant}</div>
                    <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Forms/Plant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black mb-1">{cl.maxEmployeesPerPlant}</div>
                    <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Users/Plant</div>
                  </div>
                </>
              );
            }
            const plan = PLANS.find(p => p.key === (company.subscription?.plan?.toUpperCase() || "SILVER"));
            return (
              <>
                <div className="text-center">
                  <div className="text-2xl font-black mb-1">{plan?.limits?.maxPlants === -1 ? "∞" : plan?.limits?.maxPlants}</div>
                  <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Plants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black mb-1">{plan?.limits?.maxFormsPerPlant === -1 ? "∞" : plan?.limits?.maxFormsPerPlant}</div>
                  <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Forms/Plant</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black mb-1">{plan?.limits?.maxEmployeesPerPlant === -1 ? "∞" : plan?.limits?.maxEmployeesPerPlant}</div>
                  <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Users/Plant</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}