import { Sparkles, ToggleLeft, ToggleRight } from "lucide-react";

export default function TemplateFeatureCard({ company, handleToggleCompanyTemplateFeature, updatingTemplateFeature }) {
  return (
    <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 p-6 text-white">
      <h3 className="text-xs font-black uppercase tracking-widest mb-6 pb-4 border-b border-white/20 flex items-center gap-2">
        <Sparkles size={14} />
        Template Feature
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div>
            <p className="text-sm font-bold mb-1">Company-wide Setting</p>
            <p className="text-xs text-white/80">
              {company?.templateFeatureEnabled ? "Enabled for all plants" : "Disabled for all plants"}
            </p>
          </div>
          <button
            onClick={() => handleToggleCompanyTemplateFeature(!company?.templateFeatureEnabled)}
            disabled={updatingTemplateFeature}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-violet-600 shadow-lg ${
              company?.templateFeatureEnabled ? 'bg-white' : 'bg-white/30'
            } ${updatingTemplateFeature ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full shadow-md transition-transform ${
                company?.templateFeatureEnabled ? 'translate-x-7 bg-violet-600' : 'translate-x-1 bg-white'
              }`}
            />
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-xs text-white/90 leading-relaxed">
            When enabled, plant admins can create and manage templates. You can override this setting for individual plants.
          </p>
        </div>
      </div>
    </div>
  );
}