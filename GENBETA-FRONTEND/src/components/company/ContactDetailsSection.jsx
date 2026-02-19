import { Phone, Mail } from "lucide-react";

export default function ContactDetailsSection({ form, setFacility }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
          <Phone size={20} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">Contact Information</h3>
          <p className="text-xs text-slate-500 mt-0.5">Primary contact details</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Phone size={12} className="text-emerald-500" />
            Contact Phone
          </label>
          <input
            type="tel"
            value={form.contactPhone}
            onChange={e => setFacility({ ...form, contactPhone: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Mail size={12} className="text-blue-500" />
            Official Email
          </label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={e => setFacility({ ...form, contactEmail: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
            placeholder="contact@company.com"
          />
        </div>
      </div>
    </div>
  );
}