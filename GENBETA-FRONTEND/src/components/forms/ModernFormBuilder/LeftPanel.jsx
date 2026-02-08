import React, { useState } from 'react';
import { useDraggable } from "@dnd-kit/core";
import { FIELD_GROUPS } from "./constants";
import { Search, ChevronRight, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function DraggablePaletteItem({ field }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.type,
    data: {
      type: "palette-item",
      fieldType: field.type
    }
  });

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-grab 
        hover:border-indigo-300 hover:shadow-sm transition-all group active:cursor-grabbing
        ${isDragging ? "opacity-40 grayscale" : "opacity-100"}
      `}
    >
      <div className="text-gray-400 group-hover:text-indigo-500 transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 truncate flex-1">
        {field.label}
      </span>
      <GripVertical size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function LeftPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(["basic", "special"]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const filteredGroups = FIELD_GROUPS.map(group => ({
    ...group,
    fields: group.fields.filter(f => 
      f.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.fields.length > 0);

  return (
    <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col shrink-0 z-20">
      <div className="p-4 border-b border-gray-50">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Field Palette</h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
          <input 
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {filteredGroups.map(group => (
          <div key={group.id} className="space-y-1">
            <button 
              onClick={() => toggleGroup(group.id)}
              className="flex items-center gap-1.5 w-full px-1 py-1 text-gray-400 hover:text-gray-600 transition-colors group"
            >
              <ChevronRight 
                size={14} 
                className={`transition-transform duration-200 ${expandedGroups.includes(group.id) ? "rotate-90" : ""}`} 
              />
              <span className="text-[11px] font-bold uppercase tracking-wider">{group.title}</span>
            </button>
            
            <AnimatePresence initial={false}>
              {expandedGroups.includes(group.id) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-2 p-1">
                    {group.fields.map(field => (
                      <DraggablePaletteItem key={field.type} field={field} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-xs text-gray-400">No components found</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-50 bg-gray-50/30">
        <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
          <p className="text-[11px] text-gray-500 leading-relaxed italic">
            Tip: Drag and drop fields onto the canvas to start building your form.
          </p>
        </div>
      </div>
    </aside>
  );
}
