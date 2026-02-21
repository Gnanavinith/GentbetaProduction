import { Hash, User, Mail, MapPin } from "lucide-react";
import DetailRow from "./DetailRow";

export default function CompanyDetailsSection({ company }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
        <Hash size={14} />
        Company Details
      </h3>
      <div className="space-y-5">
        <DetailRow icon={<User size={18} className="text-violet-500" />} label="Contact Phone" value={company.contactPhone} />
        <DetailRow icon={<Mail size={18} className="text-blue-500" />} label="Email Address" value={company.contactEmail} isEmail />
        <DetailRow icon={<MapPin size={18} className="text-rose-500" />} label="Official Address" value={company.address} isAddress />
      </div>
    </div>
  );
}