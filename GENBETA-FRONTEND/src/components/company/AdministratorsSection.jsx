import { Users, Shield } from "lucide-react";

export default function AdministratorsSection({ company }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Users size={14} />
          Admin Team
        </h3>
        <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-xl text-xs font-black shadow-sm">
          {company.admins?.length || 0}
        </span>
      </div>
      <div className="space-y-3">
        {company.admins?.length > 0 ? (
          company.admins.map((admin) => (
            <div key={admin._id} className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all border border-transparent hover:border-indigo-100 hover:shadow-sm group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:shadow-lg transition-shadow">
                {admin.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{admin.name}</p>
                <p className="text-xs text-slate-500 truncate">{admin.email}</p>
              </div>
              <Shield size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
            <Users className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-xs font-semibold text-slate-500">No administrators assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}