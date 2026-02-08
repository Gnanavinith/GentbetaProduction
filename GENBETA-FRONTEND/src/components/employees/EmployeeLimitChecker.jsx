import { useEffect, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { Crown, PhoneCall } from "lucide-react";

export const EmployeeLimitChecker = ({ onLimitChange }) => {
  const { user } = useAuth();
  const [usageInfo, setUsageInfo] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  
  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = async () => {
    try {
      const res = await api.get("/api/subscription/usage");
      const data = res.data.data;
      setUsageInfo(data);
      
      const currentPlant = data.plantUsage?.find(p => p.plantId === user.plantId);
      if (currentPlant) {
        const limit = currentPlant.employeesLimit;
        const isLimitReached = limit !== "Unlimited" && currentPlant.employees >= limit;
        setLimitReached(isLimitReached);
        onLimitChange?.(isLimitReached);
      }
    } catch (err) {
      console.error("Failed to check limits:", err);
    }
  };

  const currentPlant = usageInfo?.plantUsage?.find(p => p.plantId === user.plantId);
  
  if (!currentPlant) return null;

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">
              Employee Usage: {currentPlant.employees} / {currentPlant.employeesLimit}
            </span>
          </div>
          {limitReached && (
            <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
              <PhoneCall className="w-4 h-4" /> Contact Admin to Upgrade
            </span>
          )}
        </div>
        {currentPlant.employeesLimit !== "Unlimited" && (
          <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${limitReached ? 'bg-red-500' : 'bg-indigo-600'}`}
              style={{ width: `${Math.min(100, (currentPlant.employees / currentPlant.employeesLimit) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {limitReached && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Employee Limit Reached</h3>
          <p className="text-gray-600 mb-4">
            You've reached the maximum number of employees for your current plan. 
            Please contact your administrator to upgrade your plan.
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium">
            <PhoneCall className="w-4 h-4" />
            Contact Admin to Upgrade
          </div>
        </div>
      )}
    </div>
  );
};