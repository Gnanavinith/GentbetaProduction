import { Users, Mail, Phone } from "lucide-react";

export default function CompanyAdminsSection({ company }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Users size={14} />
        Administrators
      </h3>
      <div className="space-y-3">
        {company.admins && company.admins.length > 0 ? (
          company.admins.map((admin, index) => (
            <div key={admin._id || index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {admin.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{admin.name}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <Mail size={12} />
                  <span className="truncate">{admin.email}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-slate-500">
            <Users size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No administrators assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}