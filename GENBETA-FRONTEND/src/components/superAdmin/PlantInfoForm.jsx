import { Factory, Hash, MapPin } from "lucide-react";

export default function PlantInfoFacility({ formData, setFacilityData }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Factory className="w-5 h-5 text-green-600" />
          Plant Information
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Factory size={12} className="text-green-500" />
              Plant Name *
            </label>
            <input
              type="text"
              value={formData.plantName}
              onChange={(e) => setFacilityData({...formData, plantName: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
              placeholder="Enter plant name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Hash size={12} className="text-green-500" />
              Plant Number
            </label>
            <input
              type="text"
              value={formData.plantNumber}
              onChange={(e) => setFacilityData({...formData, plantNumber: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
              placeholder="Enter plant number (optional)"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} className="text-green-500" />
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFacilityData({...formData, location: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
            placeholder="Enter plant location/address"
            required
          />
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <Factory className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-green-800">Plant Details</p>
              <p className="text-xs text-green-600 mt-1">
                Enter the basic information for your new plant facility. You can add more details later in the plant settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}