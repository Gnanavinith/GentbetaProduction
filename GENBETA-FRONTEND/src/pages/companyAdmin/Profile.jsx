import { useState, useEffect } from "react";
import { 
  Building2, 
  Mail, 
  MapPin, 
  Phone,
  Calendar,
  Receipt,
  Factory,
  Globe,
  CreditCard,
  Users,
  Hash
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

export default function Profile() {
  const { token } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await apiRequest("/api/companies/my-company", "GET", null, token);
        setCompany(data);
      } catch (err) {
        setError("Failed to load company profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCompany();
    }
  }, [token]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const getPlanBadgeColor = (plan) => {
    const colors = {
      SILVER: 'bg-slate-100 text-slate-700',
      GOLD: 'bg-amber-100 text-amber-700',
      PREMIUM: 'bg-purple-100 text-purple-700',
      CUSTOM: 'bg-indigo-100 text-indigo-700'
    };
    return colors[plan] || colors.SILVER;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-8 max-w-md mx-auto mt-20">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error || "Failed to load profile"}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Company Profile</h1>
        <p className="text-slate-500 text-sm mt-1">View company details and information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center overflow-hidden">
                {company.logoUrl ? (
                  <img 
                    src={company.logoUrl} 
                    alt={company.name} 
                    className="w-full h-full object-contain p-2" 
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-indigo-600" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">{company.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-indigo-600 font-medium">{company.industry || "Enterprise"}</span>
                  {company.subscription?.plan && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPlanBadgeColor(company.subscription.plan)}`}>
                      {company.subscription.plan}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${company.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {company.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Company Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Building2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Company Name</p>
                  <p className="text-sm font-semibold text-slate-700">{company.name || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Receipt className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">GST Number</p>
                  <p className="text-sm font-semibold text-slate-700">{company.gstNumber || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Globe className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Industry</p>
                  <p className="text-sm font-semibold text-slate-700">{company.industry || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Address</p>
                  <p className="text-sm font-semibold text-slate-700">{company.address || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Contact Phone</p>
                  <p className="text-sm font-semibold text-slate-700">{company.contactPhone || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Contact Email</p>
                  <p className="text-sm font-semibold text-slate-700">{company.contactEmail || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Created On</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(company.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Last Updated</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(company.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {company.subscription && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Subscription Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Current Plan</p>
                    <p className="text-sm font-semibold text-slate-700">{company.subscription.plan || "SILVER"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Start Date</p>
                    <p className="text-sm font-semibold text-slate-700">{formatDate(company.subscription.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Hash className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Billing Cycle</p>
                    <p className="text-sm font-semibold text-slate-700 capitalize">{company.subscription.billingCycle || "Manual"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Hash className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Subscription Status</p>
                    <p className={`text-sm font-semibold ${company.subscription.isActive !== false ? 'text-emerald-600' : 'text-red-600'}`}>
                      {company.subscription.isActive !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {company.plants && company.plants.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Factory className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Plants</h3>
                <span className="ml-auto text-sm text-slate-500">{company.plants.length} total</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.plants.map((plant, idx) => (
                  <div key={plant._id || idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start gap-3">
                      <Factory className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">{plant.name}</p>
                        <p className="text-xs text-slate-400 mt-1">Code: {plant.code || "—"}</p>
                        <p className="text-xs text-slate-400">Location: {plant.location || "—"}</p>
                        {plant.plantNumber && (
                          <p className="text-xs text-slate-400">Plant No: {plant.plantNumber}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${plant.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {plant.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {company.admins && company.admins.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Administrators</h3>
              </div>
              
              <div className="space-y-3">
                {company.admins.map((admin, idx) => (
                  <div key={admin._id || idx} className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-700">{admin.name?.charAt(0) || 'A'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{admin.name || 'Admin'}</p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Status</span>
                <span className={`text-sm font-semibold ${company.isActive !== false ? 'text-emerald-600' : 'text-red-600'}`}>
                  {company.isActive !== false ? 'Operational' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Plants</span>
                <span className="text-sm font-semibold text-slate-800">{company.plants?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Industry</span>
                <span className="text-sm font-semibold text-slate-800">{company.industry || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Plan</span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getPlanBadgeColor(company.subscription?.plan)}`}>
                  {company.subscription?.plan || "SILVER"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Admins</span>
                <span className="text-sm font-semibold text-slate-800">{company.admins?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
            <p className="text-sm font-medium text-amber-800">Need to update company details?</p>
            <p className="text-xs text-amber-600 mt-1">Contact your super administrator for any changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
