import React from 'react';
import { 
  Pencil, 
  Shield, 
  Eye, 
  Loader2, 
  CheckCircle2, 
  ChevronLeft
} from "lucide-react";

export function FormBuilderHeader({ 
  formName, 
  setFormName, 
  status, 
  saveStatus, 
  activeView, 
  setActiveView, 
  handleSave, 
  loading, 
  navigate 
}) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/plant/forms")}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="h-6 w-[1px] bg-gray-100 mx-1" />
        <div className="flex items-center gap-3">
          <input 
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Untitled Template"
            className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 px-0 transition-all w-48"
          />
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
              status === 'PUBLISHED' 
                ? 'bg-green-50 text-green-700 border-green-100' 
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {status === 'PUBLISHED' ? 'Published' : 'Draft Template'}
            </span>
            <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
              {saveStatus}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex items-center bg-gray-50/50 p-1 rounded-xl border border-gray-100">
        <button 
          onClick={() => setActiveView("designer")}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 ${
            activeView === "designer" 
              ? "bg-white text-indigo-600 shadow-sm border border-gray-100" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Pencil size={14} /> Designer
        </button>
        <button 
          onClick={() => setActiveView("workflow")}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 ${
            activeView === "workflow" 
              ? "bg-white text-indigo-600 shadow-sm border border-gray-100" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield size={14} /> Workflow
        </button>
        <button 
          onClick={() => setActiveView("preview")}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 ${
            activeView === "preview" 
              ? "bg-white text-indigo-600 shadow-sm border border-gray-100" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Eye size={14} /> Preview
        </button>
      </nav>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => handleSave(true)}
          disabled={loading}
          className="px-4 py-1.5 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Publish Template
        </button>
      </div>
    </header>
  );
}
