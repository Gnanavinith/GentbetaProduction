import { useState } from "react";
import { FaRegEye as Eye, FaEdit as Edit, FaTrash as Trash2, FaUsers as Users, FaBuilding as Building, FaCheckSquare as ShieldCheck, FaGlobe as Globe, FaMedal as Medal, FaGem as Gem, FaStar as Star } from "react-icons/fa";
import { MdLocationOn as MapPin } from "react-icons/md";

const getPlanBadge = (plan) => {
  const planKey = plan?.toUpperCase() || "SILVER";
  switch(planKey) {
    case "GOLD":
      return { icon: <Medal size={12} />, bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
    case "PREMIUM":
      return { icon: <Gem size={12} />, bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" };
    default:
      return { icon: <Star size={12} />, bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
  }
};

export default function CompanyTable({ companies, loading, onViewCompany, onEditCompany, onDeleteCompany }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (companyId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="text-slate-400 mb-4">
          <Building size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Companies Found</h3>
        <p className="text-slate-600 mb-4">Get started by adding your first company</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plants</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => {
              const isExpanded = expandedRows.has(company._id);
              const planBadge = getPlanBadge(company.subscription?.plan);
              
              return (
                <tr key={company._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {company.logoUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                          <img 
                            src={company.logoUrl} 
                            alt={company.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%234f46e5'/%3E%3Ctext x='12' y='16' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3E${company.name?.charAt(0) || 'C'}%3C/text%3E%3C/svg%3E`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {company.name?.charAt(0) || 'C'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{company.name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin size={12} />
                          {company.address || 'No address specified'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      <Globe size={12} />
                      {company.industry || 'Not specified'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${planBadge.bg} ${planBadge.text} ${planBadge.border}`}>
                      <span>{planBadge.icon}</span>
                      {company.subscription?.plan || 'SILVER'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Users size={16} className="text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {company.plantsCount || company.plants?.length || 0} Plants
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <ShieldCheck size={12} />
                      Active
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewCompany(company)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditCompany(company)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Company"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteCompany(company)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}