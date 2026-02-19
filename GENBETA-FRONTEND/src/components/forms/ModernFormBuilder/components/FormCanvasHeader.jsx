import React from "react";
import { Layout, Sparkles } from "lucide-react";
import CompanyHeader from "../../../common/CompanyHeader";

export function FacilityCanvasHeader() {
  return (
    <div className="">
      {/* Default Company Header */}
      <div className="p-8 pb-4">
        <CompanyHeader />
      </div>

      <div className="px-8 pb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              Facility Design Canvas
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
              Drag fields here to build your form. Everything auto-saves.
            </p>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-slate-100 shadow-sm">
            <Sparkles size={12} className="text-indigo-500" /> 
            <span className="uppercase tracking-widest">Auto-save enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
