import { useState } from "react";
import { Factory, Plus, Trash2, Hash } from "lucide-react";

export default function PlantSetupStep({ plants, setPlants, onNext, onPrevious }) {
  const [errors, setErrors] = useState({});

  const addPlant = () => {
    setPlants([...plants, { 
      plantName: "", 
      location: "", 
      plantNumber: "" 
    }]);
  };

  const removePlant = (index) => {
    if (plants.length > 1) {
      const newPlants = plants.filter((_, i) => i !== index);
      setPlants(newPlants);
    }
  };

  const updatePlant = (index, field, value) => {
    const newPlants = [...plants];
    newPlants[index][field] = value;
    setPlants(newPlants);
    
    // Clear error when user starts typing
    if (errors[index]?.[field]) {
      const newErrors = {...errors};
      delete newErrors[index]?.[field];
      setErrors(newErrors);
    }
  };

  const validatePlants = () => {
    const newErrors = {};
    let isValid = true;

    plants.forEach((plant, index) => {
      if (!plant.plantName.trim()) {
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index].plantName = "Plant name is required";
        isValid = false;
      }
      if (!plant.location.trim()) {
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index].location = "Location is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validatePlants()) {
      // Proceed to next step (this would be handled by parent component)
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 px-8 md:px-10 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <Factory className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Plant Setup</h2>
            <p className="text-sm text-slate-600">Configure your manufacturing facilities</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-6">
        <div className="space-y-6">
          {plants.map((plant, index) => (
            <div key={index} className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-green-600" />
                  Plant #{index + 1}
                </h3>
                {plants.length > 1 && (
                  <button
                    onClick={() => removePlant(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Plant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Plant Name *
                  </label>
                  <input
                    type="text"
                    value={plant.plantName}
                    onChange={(e) => updatePlant(index, 'plantName', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm font-semibold ${
                      errors[index]?.plantName ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="Enter plant name"
                  />
                  {errors[index]?.plantName && (
                    <p className="text-xs text-red-500 font-medium">{errors[index].plantName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} className="text-green-500" />
                    Plant Number
                  </label>
                  <input
                    type="text"
                    value={plant.plantNumber}
                    onChange={(e) => updatePlant(index, 'plantNumber', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                    placeholder="Enter plant number (optional)"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Location *
                </label>
                <input
                  type="text"
                  value={plant.location}
                  onChange={(e) => updatePlant(index, 'location', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm font-semibold ${
                    errors[index]?.location ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="Enter plant location/address"
                />
                {errors[index]?.location && (
                  <p className="text-xs text-red-500 font-medium">{errors[index].location}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addPlant}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-green-500 hover:text-green-600 transition-all font-bold"
        >
          <Plus className="w-5 h-5" />
          Add Another Plant
        </button>

        <div className="pt-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
            <Factory className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-green-800">Multiple Plants Supported</p>
              <p className="text-xs text-green-600 mt-1">You can add multiple plants for this company. Each plant can have its own administrators and forms.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 via-green-50/30 to-slate-50 px-8 md:px-10 py-6 border-t-2 border-slate-200">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white rounded-xl font-bold hover:from-green-700 hover:via-green-800 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Next: Admin Setup
          </button>
        </div>
      </div>
    </div>
  );
}