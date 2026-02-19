import React from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";

export function AdminCredentialsForm({ admin, setAdmin, loading, plants, company }) {
  const isFormIncomplete = !company.companyName || !admin.name || !admin.email || admin.password.length < 6 || plants.some(p => !p.plantName);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md sticky top-8">
      <div className="h-1.5 bg-emerald-500" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Administrator</h2>
            <p className="text-sm text-slate-500">Primary access credentials.</p>
          </div>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="Admin User" 
                value={admin.name}
                onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email"
                placeholder="admin@company.com" 
                value={admin.email}
                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                placeholder="••••••••" 
                value={admin.password}
                onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic mt-1">
              Minimum 6 characters required.
            </p>
          </div>
        </div>
      </div>
      
        <div className="p-6 bg-slate-50 rounded-b-xl border-t border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-slate-500">Validation Status</span>
              <span className={isFormIncomplete ? "text-amber-600" : "text-emerald-600"}>
                {isFormIncomplete ? "Incomplete" : "Ready"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
