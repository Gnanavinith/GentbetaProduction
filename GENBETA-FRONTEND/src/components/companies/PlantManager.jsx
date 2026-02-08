import React from "react";
import { 
  Plus, 
  Factory 
} from "lucide-react";
import { PlantCard } from "./PlantCard";

export function PlantManager({ plants, onAdd, onRemove, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Factory className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Infrastructure (Plants)</h2>
        </div>
        <button 
          type="button" 
          onClick={onAdd}
          className="px-3 py-1.5 border border-blue-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plant
        </button>
      </div>

      <div className="grid gap-4">
        {plants.map((p, index) => (
          <PlantCard 
            key={index}
            plant={p}
            index={index}
            isOnlyPlant={plants.length <= 1}
            onRemove={onRemove}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
