import React from "react";
import { 
  Building2, 
  Mail, 
  Briefcase,
  MapPin,
  Upload,
  ImageIcon,
  Receipt,
  Loader2
} from "lucide-react";

export function CompanyInfoFacility({ company, setCompany, uploading, handleLogoUpload }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="h-1.5 bg-indigo-500" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Company Information</h2>
            <p className="text-sm text-slate-500">Core identity details for the new entity.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Company Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="e.g. Acme Corp" 
                  value={company.companyName}
                  onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Industry</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="e.g. Manufacturing" 
                  value={company.industry}
                  onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">GST Number</label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="e.g. 27AAAAA0000A1Z5" 
                  value={company.gstNumber}
                  onChange={(e) => setCompany({ ...company, gstNumber: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Company Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea 
                placeholder="Full registered office address..." 
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Company Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-slate-100 border border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {company.logoUrl ? (
                  <img src={`${company.logoUrl}`} alt="Preview" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {company.logoUrl ? "Change Logo" : "Upload Logo"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                  </label>
                  {company.logoUrl && (
                    <button 
                      type="button"
                      onClick={() => setCompany(prev => ({ ...prev, logoUrl: "" }))}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 italic">PNG, JPG or SVG up to 5MB. Recommended square aspect ratio.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
