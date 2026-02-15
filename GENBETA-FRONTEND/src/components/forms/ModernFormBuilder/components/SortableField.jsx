import React, { memo } from 'react';
import { 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Trash2, 
  GripVertical, 
  Settings2, 
  Maximize2,
  AlertCircle
} from "lucide-react";
import { FieldIcon, FieldPreview } from "./FieldPreview";

const WIDTHS = ["25%", "33%", "50%", "66%", "75%", "100%"];

export const SortableField = memo(function SortableField({ field, isSelected, onSelect, onDelete, onUpdate, sectionId, isPreview }) {
  const handleResize = (e) => {
    e.stopPropagation();
    const currentIndex = WIDTHS.indexOf(field.width || "100%");
    const nextIndex = (currentIndex + 1) % WIDTHS.length;
    onUpdate(field.id, { width: WIDTHS[nextIndex] });
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: field.id,
    data: {
      type: "field",
      sectionId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getWidthClass = (width) => {
    switch (width) {
      case "25%": return "w-1/4";
      case "33%": return "w-1/3";
      case "50%": return "w-1/2";
      case "66%": return "w-2/3";
      case "75%": return "w-3/4";
      case "100%": return "w-full";
      default: return "w-full";
    }
  };

  if (isPreview) {
    return (
      <div className={`px-1.5 mb-6 ${getWidthClass(field.width)}`}>
        {!["section-divider"].includes(field.type) && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <FieldPreview field={field} isPreview={true} />
        {field.helpText && <p className="mt-1.5 text-[11px] text-gray-400 italic flex items-center gap-1">
          <AlertCircle size={10} />
          {field.helpText}
        </p>}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative px-1.5 mb-4 transition-all duration-200
        ${getWidthClass(field.width)}
        ${isDragging ? "opacity-30" : "opacity-100"}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(field);
      }}
    >
      <div className={`
        h-full rounded-xl border bg-white transition-all
        ${isSelected 
          ? "border-indigo-500 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-500/10 z-10" 
          : "border-gray-100 hover:border-indigo-200 hover:shadow-sm"
        }
      `}>
        <div className={`
          flex items-center gap-3 px-4 py-2 border-b transition-colors
          ${isSelected ? "border-indigo-50" : "border-gray-50 group-hover:border-indigo-50"}
        `}>
        <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-indigo-500 transition-colors">
          <GripVertical size={14} />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-indigo-400 transition-colors">
          <FieldIcon type={field.type} />
          {field.type.replace('-', ' ')}
        </div>
        
          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button 
              onClick={handleResize}
              className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-1"
              title="Resize Field"
            >
              <Maximize2 size={13} />
              <span className="text-[10px] font-bold">{field.width || "100%"}</span>
            </button>
            <button 
              className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Field Settings"
            >

            <Settings2 size={13} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Field"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {!["section-divider"].includes(field.type) && (
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label || "Untitled Field"} {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          </div>
        )}
        <div className="opacity-60 pointer-events-none scale-[0.98] origin-left">
          <FieldPreview field={field} isPreview={false} />
        </div>
        </div>
      </div>

     

    </div>
  );
});
