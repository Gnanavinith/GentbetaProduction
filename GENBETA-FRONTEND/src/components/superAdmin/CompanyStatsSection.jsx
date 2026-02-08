import { TrendingUp, Users, Building2 } from "lucide-react";

export default function CompanyStatsSection({ company }) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <TrendingUp size={14} />
        Quick Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-3xl font-black text-indigo-600 mb-1">{company.plants?.length || 0}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plants</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-3xl font-black text-emerald-600 mb-1">{company.admins?.length || 0}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admins</div>
        </div>
      </div>
    </div>
  );
}