import { Building2, MapPin, Briefcase, Crown, Activity } from "lucide-react";

export default function CompanyOverviewSection({ company }) {
  const logoUrl = company.logoUrl ? `${company.logoUrl}` : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            {logoUrl ? (
              <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <img 
                  src={logoUrl} 
                  alt={company.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600 text-2xl font-bold shadow-sm">
                {company.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <Activity size={12} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Briefcase size={12} />
                {company.industry || "Enterprise"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                <Crown size={12} />
                {company.subscription?.plan || "Silver"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{company.name}</h2>
            <p className="text-slate-600 text-sm flex items-center gap-2">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{company.address || "Headquarters Address Not Specified"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}