import React from 'react';
import { AlertTriangle, X, ArrowUpCircle } from 'lucide-react';

export default function OverLimitWarningBanner({ 
  isOverLimit, 
  overLimitDetails, 
  onUpgradeClick,
  onClose 
}) {
  if (!isOverLimit) return null;

  const getWarningMessage = () => {
    if (overLimitDetails?.isOverPlantLimit) {
      return `You currently have ${overLimitDetails.usage.plants} plants, but your ${overLimitDetails.planId} plan allows only ${overLimitDetails.limits.maxPlants}.`;
    }
    if (overLimitDetails?.isOverFacilityLimit) {
      return `You currently have ${overLimitDetails.usage.forms} forms, but your ${overLimitDetails.planId} plan allows only ${overLimitDetails.limits.maxFacilitysPerPlant}.`;
    }
    if (overLimitDetails?.isOverEmployeeLimit) {
      return `You currently have ${overLimitDetails.usage.employees} employees, but your ${overLimitDetails.planId} plan allows only ${overLimitDetails.limits.maxEmployeesPerPlant}.`;
    }
    return "Your company is currently over plan limits.";
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-amber-900 mb-1">Plan Limit Exceeded</h3>
          <p className="text-amber-700 text-sm mb-3">
            {getWarningMessage()} 
            Existing resources will remain active, but you won't be able to create new ones until you upgrade.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-sm"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Upgrade Plan
            </button>
            
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-amber-700 text-sm font-medium rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-amber-100 transition-colors"
        >
          <X className="w-4 h-4 text-amber-600" />
        </button>
      </div>
    </div>
  );
}