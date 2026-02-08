import { useState } from "react";
import { Users, User, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

export default function AdminSetupStep({ plants, setPlants, onNext, onPrevious }) {
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({});

  const togglePasswordVisibility = (index) => {
    setShowPasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const updateAdmin = (index, field, value) => {
    const newPlants = [...plants];
    newPlants[index][field] = value;
    setPlants(newPlants);
    
    // Clear error when user starts typing
    if (errors[index]?.[field]) {
      const newErrors = {...errors};
      delete newErrors[index]?.[field];
      setErrors(newErrors);
    }
  };

  const validateAdmins = () => {
    const newErrors = {};
    let isValid = true;

    plants.forEach((plant, index) => {
      if (!plant.adminEmail.trim()) {
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index].adminEmail = "Admin email is required";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(plant.adminEmail)) {
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index].adminEmail = "Invalid email format";
        isValid = false;
      }
      
      if (!plant.adminPassword.trim()) {
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index].adminPassword = "Password is required";
        isValid = false;
      } else if (plant.adminPassword.length < 6) {
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index].adminPassword = "Password must be at least 6 characters";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateAdmins()) {
      // Proceed to next step (this would be handled by parent component)
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 px-8 md:px-10 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Administrator Setup</h2>
            <p className="text-sm text-slate-600">Create admin accounts for each plant</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-6">
        <div className="space-y-6">
          {plants.map((plant, index) => (
            <div key={index} className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {plant.plantName || `Plant #${index + 1}`} Administrator
                </h3>
                <p className="text-sm text-slate-600 mt-1">These credentials will be used to access the plant dashboard</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} className="text-blue-500" />
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={plant.adminName}
                    onChange={(e) => updateAdmin(index, 'adminName', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                    placeholder="Enter admin name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} className="text-blue-500" />
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={plant.adminEmail}
                    onChange={(e) => updateAdmin(index, 'adminEmail', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold ${
                      errors[index]?.adminEmail ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="admin@company.com"
                  />
                  {errors[index]?.adminEmail && (
                    <p className="text-xs text-red-500 font-medium">{errors[index].adminEmail}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} className="text-blue-500" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords[index] ? "text" : "password"}
                    value={plant.adminPassword}
                    onChange={(e) => updateAdmin(index, 'adminPassword', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-semibold pr-12 ${
                      errors[index]?.adminPassword ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(index)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPasswords[index] ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors[index]?.adminPassword && (
                  <p className="text-xs text-red-500 font-medium">{errors[index].adminPassword}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters required</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800">Security Notice</p>
              <p className="text-xs text-blue-600 mt-1">These administrator accounts will have full access to their respective plant dashboards. Make sure to use strong passwords.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 px-8 md:px-10 py-6 border-t-2 border-slate-200">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-xl font-bold hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Next: Plan Selection
          </button>
        </div>
      </div>
    </div>
  );
}