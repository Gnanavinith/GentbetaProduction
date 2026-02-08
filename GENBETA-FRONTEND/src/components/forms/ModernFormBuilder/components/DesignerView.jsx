import React from 'react';
import { 
  DndContext, 
  closestCorners, 
  DragOverlay
} from "@dnd-kit/core";
import { Layout } from "lucide-react";
import LeftPanel from "../LeftPanel";
import CenterPanel from "../CenterPanel";
import RightPanel from "../RightPanel";

export function DesignerView({ 
  sensors, 
  handleDragStart, 
  handleDragEnd, 
  sections, 
  selectedField, 
  setSelectedField, 
  setSections, 
  updateFieldSettings, 
  deleteField, 
  activeId 
}) {
  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />

        <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 bg-slate-50/30">
            <CenterPanel 
              sections={sections} 
              selectedField={selectedField}
              setSelectedField={setSelectedField}
              isPreview={false}
              setSections={setSections}
              updateField={updateFieldSettings}
            />

        </div>

        <RightPanel 
          selectedField={selectedField} 
          updateField={updateFieldSettings}
          deleteField={deleteField}
        />
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="px-5 py-3.5 bg-white border-2 border-indigo-500 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] opacity-95 flex items-center gap-4 animate-in fade-in zoom-in duration-200">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Layout size={18} />
            </div>
            <span className="font-black text-slate-800 capitalize tracking-tight">
              {activeId.toString().replace('-', ' ')}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
