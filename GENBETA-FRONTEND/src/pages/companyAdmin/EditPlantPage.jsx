import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Building2, MapPin, User, Mail, Lock, Loader2, Crown, PhoneCall } from "lucide-react";
import api from "../../api/api";

export default function EditPlantPage() {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    admin: {
      name: "",
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    fetchPlantDetails();
    checkLimits();
  }, [plantId]);

  const checkLimits = async () => {
    try {
      const res = await api.get("/api/subscription/usage");
      const data = res.data.data;
      setUsageInfo(data);
      
      const limit = data.usage?.plantsLimit;
      if (limit !== "Unlimited" && data.usage?.plants >= limit) {
        setLimitReached(true);
      }
    } catch (err) {
      console.error("Failed to check limits:", err);
    }
  };

  const fetchPlantDetails = async () => {
    try {
      const res = await api.get(`/api/plants/${plantId}`);
      const plant = res.data;
      
      setFormData({
        name: plant.name || "",
        location: plant.location || "",
        admin: {
          name: plant.adminName || "",
          email: plant.adminEmail || "",
          password: ""  // Don't load existing password for security
        }
      });
    } catch (err) {
      console.error("Failed to fetch plant details:", err);
      toast.error("Failed to load plant details");
      navigate("/company/plants");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const toastId = toast.loading("Updating plant...");
    
    try {
      await api.put(`/api/plants/${plantId}`, formData);
      toast.success("Plant updated successfully", { id: toastId });
      navigate("/company/plants");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update plant");
      toast.error(err.response?.data?.message || "Failed to update plant", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Plants
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Plant</h1>
        <p className="text-gray-500">Update plant information and administrator details.</p>
      </div>

      {usageInfo && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">
                Plant Usage: {usageInfo.usage?.plants} / {usageInfo.usage?.plantsLimit}
              </span>
              <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                {usageInfo.plan?.name} Plan
              </span>
            </div>
            {limitReached && (
              <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                <PhoneCall className="w-4 h-4" /> Contact Admin to Upgrade
              </span>
            )}
          </div>
          {usageInfo.usage?.plantsLimit !== "Unlimited" && (
            <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${limitReached ? 'bg-red-500' : 'bg-indigo-600'}`}
                style={{ width: `${Math.min(100, (usageInfo.usage?.plants / usageInfo.usage?.plantsLimit) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-8 ${limitReached ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Plant Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Plant Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Pune Manufacturing Unit"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Chakan, Pune"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Plant Administrator</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Admin Name</label>
              <input
                required
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.admin.name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  admin: { ...formData.admin, name: e.target.value } 
                })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="email"
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.admin.email}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    admin: { ...formData.admin, email: e.target.value } 
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Change Admin Password</h2>
          </div>
          <div className="p-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.admin.password}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    admin: { ...formData.admin, password: e.target.value } 
                  })}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep the current password unchanged</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || limitReached}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-200 transition-all"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Updating Plant..." : "Update Plant"}
          </button>
        </div>
      </form>
    </div>
  );
}