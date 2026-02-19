import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

export default function CompanyAdminStep({ companyAdmin, setCompanyAdmin, onNext, onPrevious }) {
  const [showPassword, setShowPassword] = useState(false);

  const validateFacility = () => {
    if (!companyAdmin.adminName.trim()) {
      return "Admin name is required";
    }
    if (!companyAdmin.adminEmail.trim()) {
      return "Admin email is required";
    }
    if (!/\S+@\S+\.\S+/.test(companyAdmin.adminEmail)) {
      return "Please enter a valid email address";
    }
    if (!companyAdmin.adminPassword) {
      return "Admin password is required";
    }
    if (companyAdmin.adminPassword.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateFacility();
    if (error) {
      alert(error);
      return;
    }
    onNext();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 px-8 md:px-10 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Company Administrator</h2>
            <p className="text-sm text-slate-600">Set up the main administrator account for this company</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User size={12} className="text-blue-500" />
              Administrator Name *
            </label>
            <input
              type="text"
              value={companyAdmin.adminName}
              onChange={(e) => setCompanyAdmin({...companyAdmin, adminName: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
              placeholder="Enter administrator name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} className="text-blue-500" />
              Administrator Email *
            </label>
            <input
              type="email"
              value={companyAdmin.adminEmail}
              onChange={(e) => setCompanyAdmin({...companyAdmin, adminEmail: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
              placeholder="admin@company.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} className="text-blue-500" />
            Administrator Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={companyAdmin.adminPassword}
              onChange={(e) => setCompanyAdmin({...companyAdmin, adminPassword: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold hover:border-slate-300 pr-12"
              placeholder="Enter secure password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-slate-500">Minimum 6 characters required</p>
        </div>

        <div className="pt-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800">Important Information</p>
              <p className="text-xs text-blue-600 mt-1">
                This administrator will have full access to manage the company, all plants, and users. 
                Login credentials will be sent to the provided email address.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 px-8 md:px-10 py-6 border-t-2 border-slate-200">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!companyAdmin.adminName || !companyAdmin.adminEmail || companyAdmin.adminPassword.length < 6}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              companyAdmin.adminName && companyAdmin.adminEmail && companyAdmin.adminPassword.length >= 6
                ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-blue-500/40 hover:shadow-blue-500/50'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Next: Plant Setup
          </button>
        </div>
      </div>
    </div>
  );
}