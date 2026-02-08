import { Home, MapPin, Sparkles, Plus } from "lucide-react";

export default function PlantsSection({ company, updatingTemplateFeature, handleTogglePlantTemplateFeature, isTemplateFeatureEnabled, navigate, id }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
      <div className="flex justify-between items-center mb-8 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Home size={14} />
            Operational Plants
          </h3>
          <p className="text-xs text-slate-500">Manage physical locations and plant-specific settings</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-2">
          <span className="text-lg font-black">{company.plants?.length || 0}</span>
          <span className="opacity-80">Total</span>
        </div>
      </div>

      {company.plants?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {company.plants.map((plant) => (
            <div 
              key={plant._id} 
              className="group relative p-6 bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative">
                <div className="flex justify-between items-start mb-5">
                  <div className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-lg">
                    <Home size={22} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg shadow-sm group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                    {plant.code || "CODE-NA"}
                  </span>
                </div>
                
                <h4 className="font-black text-slate-900 text-lg mb-2 group-hover:text-indigo-900 transition-colors">{plant.name}</h4>
                <p className="text-xs text-slate-500 mb-5 line-clamp-1 flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {plant.location || "No location specified"}
                </p>
                
                {/* Template Feature Toggle */}
                <div className="mb-5 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-violet-500" />
                        Template Feature
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {isTemplateFeatureEnabled(plant) ? "Enabled" : "Disabled"}
                        {plant.templateFeatureEnabled === null && ` (Inherited)`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlantTemplateFeature(plant._id, !isTemplateFeatureEnabled(plant));
                      }}
                      disabled={updatingTemplateFeature || !company?.templateFeatureEnabled}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md ${
                        isTemplateFeatureEnabled(plant) ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'
                      } ${(!company?.templateFeatureEnabled || updatingTemplateFeature) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                      title={!company?.templateFeatureEnabled ? "Enable template feature at company level first" : ""}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                          isTemplateFeatureEnabled(plant) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500"></span>
                    Active
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg"># {plant.plantNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-indigo-50/20 rounded-2xl border-2 border-dashed border-slate-300">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-slate-200">
            <Home className="text-slate-300" size={40} />
          </div>
            <h4 className="text-slate-900 font-black text-lg mb-2">No plants yet</h4>
            <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">Start by adding your first operational facility to manage forms and employees</p>
            <button 
              onClick={() => {
                if (typeof navigate === 'function' && typeof id !== 'undefined') {
                  navigate(`/super/companies/${id}/plants/add`);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Add First Plant
            </button>
        </div>
      )}
    </div>
  );
}