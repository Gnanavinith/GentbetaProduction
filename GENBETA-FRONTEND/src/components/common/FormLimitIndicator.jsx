import { useState, useEffect } from "react";
import { FileText, AlertCircle, CheckCircle } from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function FormLimitIndicator() {
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
      console.log('FormLimitIndicator API Response:', response.data); // Debug log
      if (response.data.success) {
        setUsageData(response.data.data);
        console.log('FormLimitIndicator Usage Data Set:', response.data.data); // Debug log
      }
    } catch (err) {
      setError(err.message);
      console.error('FormLimitIndicator Error:', err); // Debug log
    } finally {
      setLoading(false);
    }
  };

  if (loading || error || !usageData) {
    return null; // Don't show anything if loading, error, or no data
  }

  const { limits, plantUsage } = usageData;
  const { user } = useAuth ? useAuth() : {};
  const plantId = user?.plantId || localStorage.getItem('plantId');
  const currentPlant = plantUsage?.find(p => p.plantId?.toString() === plantId?.toString());
  
  if (!currentPlant) return null;

  const isUnlimited = (value) => value === "Unlimited" || value === -1;
  const getUsagePercentage = (used, total) => {
    if (isUnlimited(total)) return 0;
    if (total === 0) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getUsageIcon = (percentage) => {
    if (percentage >= 90) return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (percentage >= 75) return <AlertCircle className="w-4 h-4 text-amber-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const formsCount = currentPlant.forms || 0;
  const formsLimit = currentPlant.formsLimit;
  const percentage = getUsagePercentage(formsCount, formsLimit);
  const colorClass = getUsageColor(percentage);
  const icon = getUsageIcon(percentage);

  if (isUnlimited(formsLimit)) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg border border-indigo-100">
        <FileText className="w-4 h-4 text-indigo-600" />
        <span>Forms: {formsCount} used (Unlimited)</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorClass}`}>
      {icon}
      <span className="text-sm font-medium">
        Forms: {formsCount} of {formsLimit}
        {percentage >= 0 && percentage < 100 && (
          <span className="ml-1">({percentage}%)</span>
        )}
      </span>
    </div>
  );
}