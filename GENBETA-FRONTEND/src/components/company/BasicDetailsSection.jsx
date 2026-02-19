import { Building2, Briefcase } from "lucide-react";

export default function BasicDetailsSection({ form, setForm }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
          <Briefcase size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">General Information</h3>
          <p className="text-xs text-slate-500 mt-0.5">Basic company details</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Building2 size={12} className="text-indigo-500" />
            Company Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
            placeholder="Enter company name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Briefcase size={12} className="text-purple-500" />
            Industry Type
          </label>
          <input
            type="text"
            value={form.industry}
            onChange={e => setForm({ ...form, industry: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
            placeholder="e.g. Manufacturing, IT"
          />
        </div>
      </div>
    </div>
  );
}