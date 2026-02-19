import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2 } from 'lucide-react';

export default function CompanyHeader() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full mb-6">
      {/* Enterprise-Grade Facility Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch min-h-[90px]">
          
          {/* LEFT SECTION: Company Identity (Fluid) */}
          <div className="flex-1 px-6 py-5 flex items-center gap-5 min-w-0">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {user.companyLogo ? (
                <div className="w-12 h-12 rounded-lg border border-slate-100 bg-white p-1.5 flex items-center justify-center overflow-hidden">
                  <img 
                    src={user.companyLogo} 
                    alt={user.companyName} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                  <Building2 size={24} />
                </div>
              )}
            </div>

              {/* Company Info */}
              <div className="flex flex-col min-w-0">
                <h1 className="text-lg font-semibold text-slate-900 leading-tight truncate">
                  {user.companyName || 'Company Name'}
                </h1>
                <div className="flex flex-col gap-0.5 mt-1">
                  {user.companyGst && (
                    <div className="text-[11px] text-slate-500 leading-none">
                      <span className="text-slate-400 font-medium">REG/GST: </span>
                      <span className="font-semibold text-slate-600">{user.companyGst}</span>
                    </div>
                  )}
                  {user.companyAddress && (
                    <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 max-w-2xl">
                      {user.companyAddress}
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* RIGHT SECTION: Plant Info (Fixed Width) */}
          <div className="w-full md:w-[240px] px-6 py-5 bg-slate-50/30 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Plant</span>
              <span className="text-sm font-semibold text-slate-700 mt-1.5 truncate">
                {user.plantName || 'Corporate Office'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Code</span>
              <span className="text-sm font-semibold text-slate-700 mt-1.5 truncate">
                {user.plantCode || 'HQ-01'}
              </span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Subtle Divider below the header card */}
      <div className="mt-6 border-b border-slate-100 w-full opacity-60" />
    </div>
  );
}
