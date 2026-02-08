import { MapPin, Building2, User, ArrowRight, Crown, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const getPlanBadge = (plan) => {
  const planKey = plan?.toUpperCase() || "SILVER";
  switch(planKey) {
    case "GOLD":
      return { icon: "🥇", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
    case "PREMIUM":
      return { icon: "💎", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" };
    default:
      return { icon: "🥈", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
  }
};

export default function CompanyCard({ company, onEdit, onDelete }) {
  const plantNumbers = company.plants?.map(p => p.plantNumber) || [];
  const planStyle = getPlanBadge(company.subscription?.plan);

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1 relative">
      {/* Actions */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(company);
          }}
          className="p-2 bg-white text-indigo-600 rounded-lg shadow-md hover:bg-indigo-50 border border-indigo-100 transition-colors"
          title="Edit Company"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(company);
          }}
          className="p-2 bg-white text-red-600 rounded-lg shadow-md hover:bg-red-50 border border-red-100 transition-colors"
          title="Delete Company"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                {company.name}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                {company.industry || "Industry"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            Active
          </span>
          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${planStyle.bg} ${planStyle.text} border ${planStyle.border}`}>
            <span>{planStyle.icon}</span>
            {company.subscription?.plan || "Silver"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Admin</p>
            <p className="text-sm font-medium text-gray-800 truncate">
              {company.adminName || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Plants</p>
            <p className="text-sm font-medium text-gray-800">
              {company.plantsCount || 0} Operational Units
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-medium text-gray-800 line-clamp-1">
              {company.address || "Address not available"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
          <p className="text-2xl font-bold text-indigo-600">
            {company.plants?.length || 0}
          </p>
          <p className="text-xs text-gray-600 font-medium mt-1">Plants</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">
            {company.formsCount || 0}
          </p>
          <p className="text-xs text-gray-600 font-medium mt-1">Forms</p>
        </div>
      </div>

      {/* Action */}
      <Link
        to={`/super/companies/${company._id || company.id}`}
        className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold group/btn"
      >
        <span>View Details</span>
        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
