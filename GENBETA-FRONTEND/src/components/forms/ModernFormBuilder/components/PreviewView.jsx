import React from 'react';
import { Eye } from "lucide-react";
import CenterPanel from "../CenterPanel";

export function PreviewView({ sections, setSections }) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 relative p-4">
      <div className="max-w-[1400px] mx-auto mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <Eye size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Preview Mode</h4>
            <p className="text-xs text-amber-700 font-medium">This is how employees will see the form. Editing is disabled in preview mode.</p>
          </div>
        </div>
      </div>
      <div className="w-full">
        <CenterPanel 
          sections={sections} 
          isPreview={true}
          setSections={setSections}
          selectedField={null}
          setSelectedField={() => {}}
        />
      </div>
    </div>
  );
}
