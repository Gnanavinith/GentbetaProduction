import { useState, useEffect } from "react";
import { 
  Factory, 
  Mail, 
  MapPin, 
  Phone,
  Users,
  Building2,
  Hash,
  Calendar,
  User
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

export default function Profile() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlantProfile = async () => {
      try {
        const res = await apiRequest("/api/plants/my-plant", "GET", null, token);
        setData(res);
      } catch (err) {
        setError("Failed to load plant profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPlantProfile();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
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

  const { plant, company, admin, employeeCount } = data;

  return (
    <div className="w-full py-8 px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Plant Profile</h1>
        <p className="text-slate-500 text-sm mt-1">View plant and company details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Factory className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{plant.name}</h2>
                <span className="text-sm text-emerald-600 font-medium">{plant.code}</span>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${plant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {plant.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Plant Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Hash className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Plant Number</p>
                  <p className="text-sm font-semibold text-slate-700">{plant.plantNumber || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="text-sm font-semibold text-slate-700">{plant.location || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Total Employees</p>
                  <p className="text-sm font-semibold text-slate-700">{employeeCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Created On</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(plant.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {company && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Parent Company</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Company Name</p>
                      <p className="text-sm font-semibold text-slate-700">{company.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Hash className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Industry</p>
                      <p className="text-sm font-semibold text-slate-700">{company.industry || "—"}</p>
                    </div>
                  </div>
                </div>
            </div>
          )}
        </div>

          <div className="space-y-6">
            {admin && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Administrator</h3>
                
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-slate-400">Primary Access Credentials</p>
                    <p className="text-sm font-semibold text-slate-700">{admin.email}</p>
                  </div>
                </div>
              </div>
            )}

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Status</span>
                <span className={`text-sm font-semibold ${plant.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {plant.isActive ? 'Operational' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Employees</span>
                <span className="text-sm font-semibold text-slate-800">{employeeCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Plant Code</span>
                <span className="text-sm font-semibold text-slate-800">{plant.code}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
            <p className="text-sm font-medium text-amber-800">Need to update plant details?</p>
            <p className="text-xs text-amber-600 mt-1">Contact your company administrator for any changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
