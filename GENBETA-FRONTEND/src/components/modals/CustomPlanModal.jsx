import React from 'react';
import { X, Settings2, ShieldCheck, Factory, FileText, Users, Layers } from 'lucide-react';

export default function CustomPlanModal({ isOpen, onClose, limits, onSave }) {
  const [tempLimits, setTempLimits] = React.useState(limits);

  React.useEffect(() => {
    setTempLimits(limits);
  }, [limits, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(tempLimits);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Settings2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Customize Subscription Plan</h2>
              <p className="text-slate-400 text-sm">Define tailored limits for this organization</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Factory className="w-3 h-3" />
                Max Plants
              </label>
              <input 
                type="number"
                min="1"
                value={tempLimits.maxPlants}
                onChange={(e) => setTempLimits({...tempLimits, maxPlants: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <FileText className="w-3 h-3" />
                Facilitys per Plant
              </label>
              <input 
                type="number"
                min="1"
                value={tempLimits.maxFacilitysPerPlant}
                onChange={(e) => setTempLimits({...tempLimits, maxFacilitysPerPlant: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Users className="w-3 h-3" />
                Employees per Plant
              </label>
              <input 
                type="number"
                min="1"
                value={tempLimits.maxEmployeesPerPlant}
                onChange={(e) => setTempLimits({...tempLimits, maxEmployeesPerPlant: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Layers className="w-3 h-3" />
                Approval Levels
              </label>
              <input 
                type="number"
                min="1"
                max="10"
                value={tempLimits.approvalLevels}
                onChange={(e) => setTempLimits({...tempLimits, approvalLevels: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Real-time Summary Card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Custom Plan Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-indigo-600 font-bold uppercase">Plants</span>
                <span className="text-lg font-bold text-indigo-900">{tempLimits.maxPlants}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-indigo-600 font-bold uppercase">Facilitys/Plant</span>
                <span className="text-lg font-bold text-indigo-900">{tempLimits.maxFacilitysPerPlant}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-indigo-600 font-bold uppercase">Users/Plant</span>
                <span className="text-lg font-bold text-indigo-900">{tempLimits.maxEmployeesPerPlant}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-indigo-600 font-bold uppercase">Max Levels</span>
                <span className="text-lg font-bold text-indigo-900">{tempLimits.approvalLevels}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-all"
          >
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
          >
            Apply Custom Plan
          </button>
        </div>
      </div>
    </div>
  );
}
