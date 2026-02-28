import { useState, useEffect } from "react";
import { Crown, Users, FileText, Factory, Phone } from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function UsageLimitCard() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsageData();
  }, []); // Removed dependency to avoid infinite loop, will fetch once

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/subscription/usage");
      console.log('Usage API Response:', response.data); // Debug log
      if (response.data.success) {
        setUsageData(response.data.data);
        console.log('Usage Data Set:', response.data.data); // Debug log
      }
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch usage data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white animate-pulse">
        <div className="h-4 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-white/20 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/10 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !usageData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Error loading usage data</span>
        </div>
        <button 
          onClick={fetchUsageData}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const { limits, usage, plantUsage, plan } = usageData;
  
  // Get plant ID from auth context or localStorage
  const { user } = useAuth ? useAuth() : {};
  const plantId = user?.plantId || localStorage.getItem('plantId');
  
  console.log('Current plantId:', plantId); // Debug log
  console.log('Plant usage data:', plantUsage); // Debug log
  
  const currentPlant = plantUsage?.find(p => p.plantId?.toString() === plantId?.toString());
  
  console.log('Current plant matched:', currentPlant); // Debug log

  const isUnlimited = (value) => value === "Unlimited" || value === -1;

  const getUsagePercentage = (used, total) => {
    if (isUnlimited(total)) return 0;
    if (total === 0) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getUsageText = (used, total) => {
    if (isUnlimited(total)) return `${used} / ∞`;
    return `${used} / ${total}`;
  };

  const isLimitReached = (used, total) => {
    if (isUnlimited(total)) return false;
    return used >= total;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-xl shadow-indigo-500/40 p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-90 flex items-center gap-2">
            <Crown size={14} />
            Subscription Plan
          </h3>
          <span className="text-xs font-black bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            {plan?.name || "Silver"} Plan
          </span>
        </div>
        
        <div className="mb-5">
          <h4 className="text-2xl font-black capitalize mb-1">{plan?.name || "Silver"}</h4>
          <p className="text-sm text-white/80 font-semibold">Current Usage</p>
        </div>

        {/* Show current plant usage if available */}
        {currentPlant && (
          <div className="grid grid-cols-3 gap-3 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-inner mb-4">
            <div className="text-center">
              <div className="text-2xl font-black mb-1">
                {currentPlant.forms || 0}
              </div>
              <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Forms</div>
              <div className="text-xs mt-1 opacity-70">
                {getUsageText(currentPlant.forms || 0, currentPlant.formsLimit)}
              </div>
              {!isUnlimited(currentPlant.formsLimit) && (
                <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getUsageColor(getUsagePercentage(currentPlant.forms || 0, currentPlant.formsLimit))}`}
                    style={{ width: `${getUsagePercentage(currentPlant.forms || 0, currentPlant.formsLimit)}%` }}
                  />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-black mb-1">
                {currentPlant.employees || 0}
              </div>
              <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Users</div>
              <div className="text-xs mt-1 opacity-70">
                {getUsageText(currentPlant.employees || 0, currentPlant.employeesLimit)}
              </div>
              {!isUnlimited(currentPlant.employeesLimit) && (
                <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getUsageColor(getUsagePercentage(currentPlant.employees || 0, currentPlant.employeesLimit))}`}
                    style={{ width: `${getUsagePercentage(currentPlant.employees || 0, currentPlant.employeesLimit)}%` }}
                  />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-black mb-1">
                {usage?.plants || 0}
              </div>
              <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Total Plants</div>
              <div className="text-xs mt-1 opacity-70">
                {getUsageText(usage?.plants || 0, usage?.plantsLimit)}
              </div>
              {!isUnlimited(usage?.plantsLimit) && (
                <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getUsageColor(getUsagePercentage(usage?.plants || 0, usage?.plantsLimit))}`}
                    style={{ width: `${getUsagePercentage(usage?.plants || 0, usage?.plantsLimit)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall company usage if not showing plant-specific */}
        {!currentPlant && (
          <div className="grid grid-cols-3 gap-3 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-inner">
            <div className="text-center">
              <div className="text-2xl font-black mb-1">
                {usage?.forms || 0}
              </div>
              <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Forms</div>
              <div className="text-xs mt-1 opacity-70">
                {getUsageText(usage?.forms || 0, limits?.maxFormsPerPlant)}
              </div>
              {!isUnlimited(limits?.maxFormsPerPlant) && (
                <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getUsageColor(getUsagePercentage(usage?.forms || 0, limits?.maxFormsPerPlant))}`}
                    style={{ width: `${getUsagePercentage(usage?.forms || 0, limits?.maxFormsPerPlant)}%` }}
                  />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-black mb-1">
                {usage?.employees || 0}
              </div>
              <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Users</div>
              <div className="text-xs mt-1 opacity-70">
                {getUsageText(usage?.employees || 0, limits?.maxEmployeesPerPlant)}
              </div>
              {!isUnlimited(limits?.maxEmployeesPerPlant) && (
                <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getUsageColor(getUsagePercentage(usage?.employees || 0, limits?.maxEmployeesPerPlant))}`}
                    style={{ width: `${getUsagePercentage(usage?.employees || 0, limits?.maxEmployeesPerPlant)}%` }}
                  />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-black mb-1">
                {usage?.plants || 0}
              </div>
              <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Plants</div>
              <div className="text-xs mt-1 opacity-70">
                {getUsageText(usage?.plants || 0, limits?.maxPlants)}
              </div>
              {!isUnlimited(limits?.maxPlants) && (
                <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getUsageColor(getUsagePercentage(usage?.plants || 0, limits?.maxPlants))}`}
                    style={{ width: `${getUsagePercentage(usage?.plants || 0, limits?.maxPlants)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Limit reached warnings */}
        {(currentPlant && isLimitReached(currentPlant.forms, currentPlant.formsLimit)) || 
         (!currentPlant && isLimitReached(usage.forms, limits.maxFormsPerPlant)) ? (
          <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-center">
            <div className="text-sm font-semibold text-red-100 flex items-center justify-center gap-2">
              <Phone size={14} />
              Form limit reached. Contact admin to upgrade.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}