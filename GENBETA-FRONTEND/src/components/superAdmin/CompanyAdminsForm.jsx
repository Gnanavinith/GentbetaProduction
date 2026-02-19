import { useState } from "react";
import { Users, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function CompanyAdminsFacility({ adminData, setAdminData, company }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Administrator Account
        </h2>
        <p className="text-xs text-slate-600 mt-1">Update the primary administrator credentials</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800">Primary Administrator</p>
              <p className="text-xs text-blue-600 mt-1">
                This is the main administrator account for the company. Changes here will update the existing admin account.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User size={12} className="text-blue-500" />
              Admin Name
            </label>
            <input
              type="text"
              value={adminData.adminName}
              onChange={(e) => setAdminData({...adminData, adminName: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
              placeholder="Enter admin name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} className="text-blue-500" />
              Admin Email *
            </label>
            <input
              type="email"
              value={adminData.adminEmail}
              onChange={(e) => setAdminData({...adminData, adminEmail: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
              placeholder="admin@company.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} className="text-blue-500" />
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={adminData.adminPassword}
              onChange={(e) => setAdminData({...adminData, adminPassword: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold pr-12 hover:border-slate-300"
              placeholder="Leave blank to keep current password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-slate-500">Only enter a new password if you want to change it</p>
        </div>

        {company.admins && company.admins.length > 1 && (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Multiple Administrators Exist</p>
                <p className="text-xs text-amber-600 mt-1">
                  This company has {company.admins.length} administrators. This form only updates the primary administrator. 
                  To manage other administrators, please use the company detail page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}