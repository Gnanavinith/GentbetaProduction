import React from "react";
import { 
  Trash2, 
  Globe, 
  ShieldCheck 
} from "lucide-react";

export function PlantCard({ plant, index, isOnlyPlant, onRemove, onUpdate }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden group">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 bg-white border border-slate-200 rounded text-xs font-bold text-slate-500">
            {index + 1}
          </span>
          <h3 className="text-sm font-semibold text-slate-700">Plant Configuration</h3>
        </div>
        {!isOnlyPlant && (
          <button 
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Remove Plant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Plant Name *</label>
            <input 
              placeholder="Primary Facility" 
              value={plant.plantName} 
              onChange={(e) => onUpdate(index, "plantName", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Plant Code</label>
            <input 
              placeholder="P001" 
              value={plant.plantNumber} 
              onChange={(e) => onUpdate(index, "plantNumber", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Location</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                placeholder="City, Region" 
                value={plant.location} 
                onChange={(e) => onUpdate(index, "location", e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Plant Admin Section */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Plant Administrator (Optional)</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Admin Name</label>
              <input 
                placeholder="Plant Manager Name"
                value={plant.adminName}
                onChange={(e) => onUpdate(index, "adminName", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Admin Email</label>
              <input 
                type="email"
                placeholder="padmin@company.com"
                value={plant.adminEmail}
                onChange={(e) => onUpdate(index, "adminEmail", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Temp Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                value={plant.adminPassword}
                onChange={(e) => onUpdate(index, "adminPassword", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
