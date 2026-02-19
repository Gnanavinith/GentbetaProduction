import { useState } from "react";
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Briefcase, 
  Eye,
  EyeOff
} from "lucide-react";

export const EmployeeFormFields = ({ formData, setFormData, showPassword, setShowPassword }) => {
  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all";
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-gray-400" />
          Full Name
        </label>
        <input
          required
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={inputClasses}
          placeholder="Ramesh Kumar"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          Email Address
        </label>
        <input
          required
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={inputClasses}
          placeholder="ramesh@plant.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          Position
        </label>
        <input
          required
          type="text"
          value={formData.position}
          onChange={(e) => handleInputChange('position', e.target.value)}
          className={inputClasses}
          placeholder="Shift Manager"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          className={inputClasses}
          placeholder="+91 9876543210"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          Password
        </label>
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`${inputClasses} pr-12`}
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};