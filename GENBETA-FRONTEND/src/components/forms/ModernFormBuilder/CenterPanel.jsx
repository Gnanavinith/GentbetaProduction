import React, { useState, useCallback, memo } from "react";
import {
  SortableContext,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import { Trash2, Plus, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SortableField } from "./components/SortableField";
import { DroppableSection } from "./components/DroppableSection";
import { FacilityCanvasHeader } from "./components/FormCanvasHeader";

const FacilitySection = memo(React.forwardRef(function FacilitySection({ 
  section, 
  isCollapsed, 
  editingSectionId, 
  setEditingSectionId, 
  toggleSection, 
  updateSectionTitle, 
  deleteSection, 
  sectionsCount, 
  isPreview, 
  selectedField, 
  setSelectedField, 
  deleteFieldFromSection, 
  updateField 
}, ref) {
  const fieldCount = section.fields?.length || 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`group/section rounded-2xl transition-all duration-300 ${isCollapsed ? "bg-gray-50/50 border border-gray-100/50" : ""}`}
    >
      <div 
        onClick={() => !editingSectionId && toggleSection(section.id)}
        onKeyDown={(e) => {
          if (!editingSectionId && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            toggleSection(section.id);
          }
        }}
        tabIndex={0}
        className={`flex items-center justify-between mb-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors ${!isCollapsed ? "mb-4" : ""}`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            {editingSectionId === section.id ? (
              <input
                autoFocus
                value={section.title}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                onBlur={() => setEditingSectionId(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") setEditingSectionId(null);
                }}
                className="text-sm font-bold text-gray-900 bg-white border border-indigo-200 rounded-md px-2 py-1 outline-none w-full max-w-xs focus:ring-2 focus:ring-indigo-100"
              />
            ) : (
                <div className="flex items-center gap-2">
                  <h3 
                    className="text-sm font-bold text-gray-900 transition-colors"
                  >
                    {section.title || "Untitled Section"}
                  </h3>
                  {isCollapsed && fieldCount > 0 && (
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {fieldCount} {fieldCount === 1 ? 'field' : 'fields'} hidden
                    </span>
                  )}
                  {!isPreview && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-all ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSectionId(section.id);
                        }}
                        title="Edit section name"
                        className="p-1 text-gray-300 hover:text-indigo-600 transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      {sectionsCount > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(section.id);
                          }}
                          title="Delete section"
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSection(section.id);
          }}
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
        >
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
              <DroppableSection sectionId={section.id} isPreview={isPreview} disabled={isCollapsed}>
                <SortableContext
                  id={section.id}
                  items={(section.fields || []).map(f => f.id)}
                    strategy={rectSortingStrategy}

                >
                  <div className={`
                    min-h-[100px] rounded-xl transition-all duration-200 px-2
                    ${!isPreview && section.fields.length === 0 ? "border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center p-8 mb-4" : "flex flex-wrap gap-y-3 pb-6 -mx-1.5"}
                  `}>
                    {!isPreview && section.fields.length === 0 && (

                    <>
                      <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm mb-3 text-gray-300">
                        <Plus size={20} />
                      </div>
                      <p className="text-[11px] font-medium text-gray-400">Drag fields here</p>
                    </>
                  )}

                  {(section.fields || []).map(field => (
                      <SortableField
                        key={field.id}
                        field={field}
                        sectionId={section.id}
                        isSelected={selectedField?.id === field.id}
                        onSelect={setSelectedField}
                        onDelete={deleteFieldFromSection}
                        onUpdate={updateField}
                        isPreview={isPreview}
                      />

                  ))}
                </div>
              </SortableContext>
            </DroppableSection>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}));

export default memo(function CenterPanel({
  sections,
  selectedField,
  setSelectedField,
  isPreview,
  setSections,
  updateField
}) {
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState(new Set());

  const toggleSection = useCallback((id) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addSection = useCallback(() => {
    setSections(prev => [
      ...prev,
      {
        id: `section-${Date.now()}`,
        title: "New Section",
        fields: []
      }
    ]);
  }, [setSections]);

  const updateSectionTitle = useCallback((id, title) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, title } : s))
    );
  }, [setSections]);

  const deleteFieldFromSection = useCallback((id) => {
    setSections(prev =>
      prev.map(s => ({
        ...s,
        fields: (s.fields || []).filter(f => f.id !== id)
      }))
    );
    setSelectedField(prev => prev?.id === id ? null : prev);
  }, [setSections, setSelectedField]);

  const deleteSection = useCallback((id) => {
    setSections(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(s => s.id !== id);
    });
  }, [setSections]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fc] p-8 flex flex-col items-center">
      {/* A4 Size Container */}
      <div className="w-[210mm] min-h-[297mm] bg-white border border-gray-300 shadow-2xl flex flex-col mb-20 relative origin-top scale-[0.85] 2xl:scale-100">
        <FacilityCanvasHeader />

        <div className="flex-1 p-[15mm] space-y-8">
          <AnimatePresence mode="popLayout">
            {sections.map((section) => (
              <FacilitySection
                key={section.id}
                section={section}
                isCollapsed={collapsedSections.has(section.id)}
                editingSectionId={editingSectionId}
                setEditingSectionId={setEditingSectionId}
                toggleSection={toggleSection}
                updateSectionTitle={updateSectionTitle}
                deleteSection={deleteSection}
                sectionsCount={sections.length}
                isPreview={isPreview}
                selectedField={selectedField}
                setSelectedField={setSelectedField}
                deleteFieldFromSection={deleteFieldFromSection}
                updateField={updateField}
              />
            ))}
          </AnimatePresence>

          {!isPreview && (
            <button
              onClick={addSection}
              className="w-full py-4 border-2 border-dashed border-gray-100 rounded-xl text-[11px] font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Plus size={14} /> Add New Section
            </button>
          )}
        </div>

        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-center gap-4">
          <div className="h-px bg-gray-100 flex-1" />
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">End of Facility</span>
          <div className="h-px bg-gray-100 flex-1" />
        </div>
      </div>
    </div>
  );
});
