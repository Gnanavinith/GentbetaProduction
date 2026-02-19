import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function PlansPage() {
  const navigate = useNavigate();
  const [usageInfo, setUsageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsageInfo();
  }, []);

  const fetchUsageInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/subscription/usage");
      setUsageInfo(res.data.data);
    } catch (err) {
      console.error("Failed to fetch usage info:", err);
      setError(err.response?.data?.message || "Failed to load usage information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          {/* Plant Usage Loading Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  const { plan, plantUsage = [] } = usageInfo;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription & Usage</h1>
        <p className="text-gray-500">Current plan details and resource usage statistics.</p>
      </div>

      {/* Plan Overview Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{plan?.name} Plan</h2>
            <p className="text-indigo-100 mt-1">{plan?.description}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-3xl font-bold">{plan?.price === 0 ? "Free" : `$${plan?.price}/month`}</div>
            <div className="text-indigo-200 text-sm">Billed {plan?.billingCycle}</div>
          </div>
        </div>
      </div>

      {/* Plant-wise Form Usage */}
      {plantUsage && plantUsage.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Form Usage by Plant</h3>
          <div className="space-y-3">
            {plantUsage.map((plant) => {
              const formsRemaining = plant.formsLimit === "Unlimited" 
                ? "Unlimited" 
                : plant.formsLimit - plant.forms;
              
              const isOverLimit = plant.formsLimit !== "Unlimited" && plant.forms >= plant.formsLimit;
              
              return (
                <div key={plant.plantId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{plant.plantName}</h4>
                    <p className="text-sm text-gray-500">{plant.forms} of {plant.formsLimit} forms used</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                      {formsRemaining} remaining
                    </div>
                    {isOverLimit && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                        Over Limit
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
}