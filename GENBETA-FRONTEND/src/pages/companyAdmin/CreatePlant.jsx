import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Building2, MapPin, User, Mail, Lock, Loader2, Crown, PhoneCall } from "lucide-react";
import axios from "axios";

export default function CreatePlant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    checkLimits();
  }, []);

  const checkLimits = async () => {
    try {
      const res = await axios.get("/api/subscription/usage");
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

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      const toastId = toast.loading("Creating new plant...");
      try {
        await axios.post("/api/plants", formData);
        toast.success("Plant created successfully", { id: toastId });
        navigate("/company/plants");
      } catch (err) {
        if (err.response?.data?.upgradeRequired) {
          setLimitReached(true);
        }
        setError(err.response?.data?.message || "Failed to create plant");
        toast.error(err.response?.data?.message || "Failed to create plant", { id: toastId });
      } finally {
        setLoading(false);
      }
    };

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
        <h1 className="text-3xl font-bold text-gray-900">Add New Plant</h1>
        <p className="text-gray-500">Create a new manufacturing unit and assign a plant administrator.</p>
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

        {limitReached && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Plant Limit Reached</h3>
            <p className="text-gray-600 mb-4">
              You've reached the maximum number of plants for your current plan. 
              Please contact your administrator to upgrade your plan.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium">
              <PhoneCall className="w-4 h-4" />
              Contact Admin to Upgrade
            </div>
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
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Temp Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="password"
                  placeholder="********"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.admin.password}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    admin: { ...formData.admin, password: e.target.value } 
                  })}
                />
              </div>
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
            disabled={loading || limitReached}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-200 transition-all"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating Plant..." : "Create Plant"}
          </button>
        </div>
      </form>
    </div>
  );
}
