import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Input, Section } from "../../components/modals/Modal";
import { Home, ArrowLeft, Plus, Save, MapPin, User, Mail, Lock, Building2, Hash } from "lucide-react";

export default function AddPlantPage() {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [plant, setPlant] = useState({
    plantName: "",
    location: "",
    plantNumber: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

    const save = async () => {
      if (!plant.plantName || !plant.location || !plant.adminEmail || !plant.adminPassword) {
        toast.error("Please fill in all the required fields");
        return;
      }
  
      const toastId = toast.loading("Creating new plant...");
      try {
        setLoading(true);
        
        // Prepare the request body to match backend expectations
        const requestBody = {
          companyId,
          name: plant.plantName,
          location: plant.location,
          plantNumber: plant.plantNumber || undefined,
          admin: {
            name: plant.adminName || plant.adminEmail.split('@')[0], // Use email prefix if no name
            email: plant.adminEmail,
            password: plant.adminPassword
          }
        };

        console.log("Creating plant with data:", requestBody);
        
        await apiRequest(
          "/api/plants",
          "POST",
          requestBody,
          token
        );
  
        toast.success("Plant created successfully", { id: toastId });
        navigate(`/super/companies/${companyId}`);
      } catch (err) {
        console.error("Create plant error:", err);
        toast.error(err.message || "Failed to add plant", { id: toastId });
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 min-h-screen">
      <div className="relative">
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
          <div className="w-full px-6 md:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/super/companies/${companyId}`)}
                className="group flex items-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all gap-2.5"
              >
                <div className="p-2 rounded-xl group-hover:bg-indigo-50 transition-all group-hover:shadow-sm">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                Back to Company
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/super/companies/${companyId}`)}
                disabled={loading}
                className="hidden md:block px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Plant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full px-6 md:px-8 py-8 space-y-8">
          <div className="w-full space-y-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-2xl shadow-xl shadow-indigo-500/40">
                    <Home className="w-10 h-10" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-lg"></div>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Add New Plant</h1>
                  <p className="text-slate-600 font-medium">Create a new manufacturing facility and assign a plant administrator</p>
                </div>
              </div>
            </div>

            {/* Main Facility Card */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-8 md:px-10 py-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 mb-1">Plant Details</h2>
                    <p className="text-sm text-slate-600">Configure plant information and admin credentials</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-600">New Plant</span>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-10">
                {/* Plant Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <Building2 size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Plant Information</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Basic facility details</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Home size={12} className="text-indigo-500" />
                        Plant Name
                      </label>
                      <input
                        type="text"
                        value={plant.plantName}
                        onChange={e => setPlant({ ...plant, plantName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="e.g. Pune Manufacturing Unit"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} className="text-rose-500" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={plant.location}
                        onChange={e => setPlant({ ...plant, location: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="e.g. Chakan, Pune"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} className="text-purple-500" />
                        Plant Number
                      </label>
                      <input
                        type="text"
                        value={plant.plantNumber}
                        onChange={e => setPlant({ ...plant, plantNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="e.g. PN-001 (optional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs font-bold text-slate-400 bg-white uppercase tracking-widest">Administrator Credentials</span>
                  </div>
                </div>

                {/* Plant Administrator */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                      <User size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Plant Administrator</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Admin account details for this facility</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} className="text-emerald-500" />
                        Admin Name
                      </label>
                      <input
                        type="text"
                        value={plant.adminName}
                        onChange={e => setPlant({ ...plant, adminName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} className="text-blue-500" />
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value={plant.adminEmail}
                        onChange={e => setPlant({ ...plant, adminEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Lock size={12} className="text-amber-500" />
                        Temporary Password
                      </label>
                      <input
                        type="password"
                        value={plant.adminPassword}
                        onChange={e => setPlant({ ...plant, adminPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-slate-500 mt-2 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">ℹ️</span>
                        <span>Admin will be required to change this password on first login</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 px-8 md:px-10 py-8 border-t-2 border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                      <Plus size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Ready to create plant?</p>
                      <p className="text-xs text-slate-500">Plant admin will receive login credentials via email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => navigate(`/super/companies/${companyId}`)}
                      className="flex-1 sm:flex-none px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-all rounded-xl hover:bg-white/80 border-2 border-transparent hover:border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={save}
                      disabled={loading}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                        loading 
                          ? 'bg-slate-400 cursor-not-allowed text-white' 
                          : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-800 shadow-indigo-500/40 hover:shadow-indigo-500/50'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          <span>Create Plant</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
