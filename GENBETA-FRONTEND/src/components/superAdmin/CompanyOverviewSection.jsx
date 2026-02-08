import { Building2, MapPin, Briefcase, Crown, Activity } from "lucide-react";

export default function CompanyOverviewSection({ company }) {
  const logoUrl = company.logoUrl ? `${company.logoUrl}` : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
      <div className="h-48 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>
      <div className="px-8 pb-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="relative -mt-24">
            {logoUrl ? (
              <div className="w-56 h-56 rounded-3xl border-4 border-white shadow-2xl shadow-slate-900/20 bg-white p-4 ring-1 ring-slate-100">
                <img 
                  src={logoUrl} 
                  alt={company.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-56 h-56 rounded-3xl border-4 border-white shadow-2xl shadow-slate-900/20 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-7xl font-black ring-1 ring-slate-100">
                {company.name?.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl shadow-lg flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider shadow-sm">
                <Briefcase size={12} />
                {company.industry || "Enterprise"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider shadow-sm">
                <Crown size={12} />
                {company.subscription?.plan || "Silver"}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{company.name}</h1>
            <p className="text-slate-600 text-sm flex items-center gap-2 font-medium">
              <MapPin size={16} className="text-slate-400" />
              {company.address || "Headquarters Address Not Specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}