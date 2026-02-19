import { Shield, FileText, MapPin } from "lucide-react";

export default function ComplianceAddressSection({ form, setForm }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
          <Shield size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">Compliance & Location</h3>
          <p className="text-xs text-slate-500 mt-0.5">Tax details and physical address</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <FileText size={12} className="text-amber-500" />
            GST Number
          </label>
          <input
            type="text"
            value={form.gstNumber}
            onChange={e => setForm({ ...form, gstNumber: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
            placeholder="22AAAAA0000A1Z5"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Full Office Address
          </label>
          <textarea
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold min-h-[120px] hover:border-slate-300 resize-none"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Street address, Building, Suite, City, State, Postal Code"
          />
        </div>
      </div>
    </div>
  );
}