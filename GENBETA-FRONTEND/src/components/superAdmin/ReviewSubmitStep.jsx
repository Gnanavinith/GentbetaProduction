import { CheckCircle2, AlertCircle, Building2, Factory, Crown, Shield, Loader2 } from "lucide-react";

export default function ReviewSubmitStep({ 
  company, 
  companyAdmin,
  plants, 
  selectedPlan, 
  customLimits, 
  onPrevious, 
  onSubmit, 
  loading 
}) {
  const getPlanIcon = (planKey) => {
    switch(planKey?.toUpperCase()) {
      case "GOLD": return "🥇";
      case "PREMIUM": return "💎";
      case "CUSTOM": return "✨";
      default: return "🥈";
    }
  };

  const getPlanDetails = (planKey) => {
    const planMap = {
      "SILVER": { name: "Silver", limits: { maxPlants: 1, maxFormsPerPlant: 10, maxEmployeesPerPlant: 20, approvalLevels: 3 } },
      "GOLD": { name: "Gold", limits: { maxPlants: 5, maxFormsPerPlant: 50, maxEmployeesPerPlant: 100, approvalLevels: 5 } },
      "PREMIUM": { name: "Premium", limits: { maxPlants: -1, maxFormsPerPlant: -1, maxEmployeesPerPlant: -1, approvalLevels: -1 } },
      "CUSTOM": { name: "Custom", limits: customLimits }
    };
    return planMap[planKey] || planMap.SILVER;
  };

  const planDetails = getPlanDetails(selectedPlan);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 px-8 md:px-10 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Review & Submit</h2>
            <p className="text-sm text-slate-600">Review all details before creating the company</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-8">
        {/* Company Information */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-slate-700">Company Name:</span>
              <p className="text-slate-900">{company.companyName || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Industry:</span>
              <p className="text-slate-900">{company.industry || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Contact Email:</span>
              <p className="text-slate-900">{company.contactEmail || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Address:</span>
              <p className="text-slate-900">{company.address || 'Not specified'}</p>
            </div>
            {company.gstNumber && (
              <div>
                <span className="font-semibold text-slate-700">GST Number:</span>
                <p className="text-slate-900">{company.gstNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Admin Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Company Administrator</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Name</p>
              <p className="text-sm font-semibold text-slate-900">{companyAdmin.adminName || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</p>
              <p className="text-sm font-semibold text-slate-900">{companyAdmin.adminEmail || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</p>
              <p className="text-sm font-semibold text-slate-900">••••••••</p>
            </div>
          </div>
        </div>

        {/* Plants Information */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5 text-green-600" />
            Plants ({plants.length})
          </h3>
          <div className="space-y-4">
            {plants.map((plant, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Plant #{index + 1}: {plant.plantName || 'Unnamed Plant'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Location:</span>
                    <p className="text-slate-900">{plant.location || 'Not specified'}</p>
                  </div>
                  {plant.plantNumber && (
                    <div>
                      <span className="font-medium text-slate-700">Plant Number:</span>
                      <p className="text-slate-900">{plant.plantNumber}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-slate-700">Admin Email:</span>
                    <p className="text-slate-900">{plant.adminEmail || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Admin Name:</span>
                    <p className="text-slate-900">{plant.adminName || plant.adminEmail?.split('@')[0] || 'Auto-generated'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Information */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-600" />
            Subscription Plan
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">{getPlanIcon(selectedPlan)}</div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">{planDetails.name} Plan</h4>
              <p className="text-sm text-slate-600">
                {selectedPlan === 'CUSTOM' 
                  ? 'Custom configured limits' 
                  : 'Predefined plan limits'
                }
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Plants</div>
              <div className="font-bold text-slate-900">
                {planDetails.limits.maxPlants === -1 ? '∞ Unlimited' : planDetails.limits.maxPlants}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Forms per Plant</div>
              <div className="font-bold text-slate-900">
                {planDetails.limits.maxFormsPerPlant === -1 ? '∞ Unlimited' : planDetails.limits.maxFormsPerPlant}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Employees per Plant</div>
              <div className="font-bold text-slate-900">
                {planDetails.limits.maxEmployeesPerPlant === -1 ? '∞ Unlimited' : planDetails.limits.maxEmployeesPerPlant}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Approval Levels</div>
              <div className="font-bold text-slate-900">
                {planDetails.limits.approvalLevels === -1 ? '∞ Unlimited' : planDetails.limits.approvalLevels}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-800 mb-2">Ready to Create Company</h4>
              <p className="text-sm text-blue-700">
                Once you submit, the company will be created with all the plants and administrators you've configured. 
                All users will receive welcome emails with their login credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 px-8 md:px-10 py-6 border-t-2 border-slate-200">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
          >
            Previous
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 text-white rounded-xl font-bold hover:from-emerald-700 hover:via-emerald-800 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Create Company
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}