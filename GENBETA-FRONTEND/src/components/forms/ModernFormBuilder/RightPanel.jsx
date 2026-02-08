import { 
  Settings, 
  Trash2, 
  Info, 
  Plus,
  Minus,
  Maximize2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  CheckCircle2,
  AlertCircle,
  Rows3,
  Columns3
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RightPanel({ selectedField, updateField, deleteField }) {
  if (!selectedField) {
    return (
      <aside className="w-[320px] bg-white border-l border-gray-100 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
          <Settings size={32} />
        </div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Properties Inspector</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Select a field to edit its properties and validation.</p>
        </aside>
    );
  }

  const [activeTab, setActiveTab] = useState("settings");

  const handleChange = (key, value) => {
    updateField(selectedField.id, { [key]: value });
  };

    const tabs = [
      { id: "settings", label: "Settings", icon: Settings },
    ];

  const renderBasicSettings = () => (
    <>
      {/* Field Label */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Field Label</label>
        <input 
          value={selectedField.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
        />
      </div>

      {/* Placeholder */}
      {!["section-header", "spacer", "signature", "checklist", "grid-table", "columns-2", "columns-3", "auto-date", "auto-user", "description"].includes(selectedField.type) && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Placeholder</label>
          <input 
            value={selectedField.placeholder || ""}
            onChange={(e) => handleChange("placeholder", e.target.value)}
            placeholder="e.g. Enter value..."
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
          />
        </div>
      )}

        {/* Help Text */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
            Help Text
            <Info size={12} className="text-gray-300" />
          </label>
          <input 
            value={selectedField.helpText || ""}
            onChange={(e) => handleChange("helpText", e.target.value)}
            placeholder="Subtext for the field"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
          />
        </div>

        {/* Approval Email Toggle - NEW FEATURE */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approval Email</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Include in email to approvers</span>
              <div 
                onClick={() => handleChange("includeInApprovalEmail", !selectedField.includeInApprovalEmail)}
                className={`relative w-10 h-5 rounded-full cursor-pointer transition-all ${
                  selectedField.includeInApprovalEmail 
                    ? "bg-indigo-600" 
                    : "bg-gray-300"
                }`}
              >
                <div 
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${
                    selectedField.includeInApprovalEmail 
                      ? "translate-x-5" 
                      : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            When enabled, this field's value will be included in approval emails sent to approvers.
          </p>
        </div>

        {/* Content Editor for Terms/Description */}
        {["terms", "description"].includes(selectedField.type) && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content / Text</label>
            <textarea 
              value={selectedField.content || ""}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={5}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all resize-none custom-scrollbar"
              placeholder="Enter text content here..."
            />
          </div>
        )}

        {/* Width & Alignment Grid */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Maximize2 size={11} /> Width
          </label>
            <select 
              value={selectedField.width || "100%"}
              onChange={(e) => handleChange("width", e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
            >
              {["25%", "33%", "50%", "66%", "75%", "100%"].map(w => <option key={w} value={w}>{w}</option>)}
            </select>

        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alignment</label>
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
            {[
              { id: "left", icon: AlignLeft },
              { id: "center", icon: AlignCenter },
              { id: "right", icon: AlignRight }
            ].map(align => (
              <button
                key={align.id}
                onClick={() => handleChange("alignment", align.id)}
                className={`flex-1 py-1 rounded-md flex items-center justify-center transition-all ${selectedField.alignment === align.id ? "bg-white text-indigo-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
              >
                <align.icon size={13} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <aside className="w-[320px] bg-white border-l border-gray-100 flex flex-col shrink-0 z-20 overflow-hidden shadow-[-4px_0_20px_rgba(0,0,0,0.02)]">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-bold text-gray-900 leading-none mb-1">Properties Inspector</h3>
          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{selectedField.type}</span>
        </div>
        <button 
          onClick={() => deleteField(selectedField.id)}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Delete Field"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <nav className="flex items-center bg-gray-50/50 p-1 mx-4 mt-4 rounded-xl border border-gray-100">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm border border-gray-100" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={12} />
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "settings" && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {renderBasicSettings()}

                {selectedField.type === "checklist" && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Checklist Items</label>
                      <div className="space-y-2">
                        {selectedField.items?.map((item, i) => (
                          <div key={item.id || i} className="flex gap-2">
                            <input 
                              value={item.question}
                              onChange={(e) => {
                                const newItems = [...selectedField.items];
                                newItems[i] = { ...newItems[i], question: e.target.value };
                                handleChange("items", newItems);
                              }}
                              placeholder="Checklist question..."
                              className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
                            />
                            <button 
                              onClick={() => handleChange("items", selectedField.items.filter((_, idx) => idx !== i))}
                              className="p-1.5 text-gray-300 hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => handleChange("items", [...(selectedField.items || []), { id: `item-${Date.now()}`, question: `New item ${(selectedField.items?.length || 0) + 1}` }])}
                          className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus size={12} /> ADD CHECKLIST ITEM
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response Options</label>
                      <div className="space-y-2">
                        {selectedField.options?.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input 
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...selectedField.options];
                                newOpts[i] = e.target.value;
                                handleChange("options", newOpts);
                              }}
                              className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
                            />
                            <button 
                              onClick={() => handleChange("options", selectedField.options.filter((_, idx) => idx !== i))}
                              className="p-1.5 text-gray-300 hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => handleChange("options", [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`])}
                          className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus size={12} /> ADD OPTION
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {["dropdown", "radio", "checkbox"].includes(selectedField.type) && (
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options Management</label>
                    <div className="space-y-2">
                      {selectedField.options?.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...selectedField.options];
                              newOpts[i] = e.target.value;
                              handleChange("options", newOpts);
                            }}
                            className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
                          />
                          <button 
                            onClick={() => handleChange("options", selectedField.options.filter((_, idx) => idx !== i))}
                            className="p-1.5 text-gray-300 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => handleChange("options", [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`])}
                        className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={12} /> ADD OPTION
                      </button>
                    </div>
                  </div>
                )}

                {selectedField.type === "grid-table" && (
                  <div className="space-y-4 pt-2 border-t border-gray-50">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Table Configuration</label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Rows3 size={11} /> Rows
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleChange("rows", Math.max(1, (selectedField.rows || 1) - 1))}
                            className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                            disabled={(selectedField.rows || 1) <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={selectedField.rows || 1}
                            onChange={(e) => handleChange("rows", Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 text-center focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                          />
                          <button
                            onClick={() => handleChange("rows", Math.min(50, (selectedField.rows || 1) + 1))}
                            className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Columns3 size={11} /> Columns
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const cols = selectedField.columns || [];
                                if (cols.length > 1) {
                                  handleChange("columns", cols.slice(0, -1));
                                }
                              }}
                              className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                              disabled={(selectedField.columns?.length || 2) <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={selectedField.columns?.length || 2}
                              onChange={(e) => {
                                const newCount = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                                const currentCols = selectedField.columns || [];
                                let newCols;
                                if (newCount > currentCols.length) {
                                  newCols = [...currentCols];
                                  for (let i = currentCols.length; i < newCount; i++) {
                                    newCols.push({ id: `col${i + 1}`, label: `Column ${i + 1}`, width: `160px` });
                                  }
                                } else {
                                  newCols = currentCols.slice(0, newCount);
                                }
                                handleChange("columns", newCols);
                              }}
                              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 text-center focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                            />
                            <button
                              onClick={() => {
                                const cols = selectedField.columns || [];
                                if (cols.length < 10) {
                                  handleChange("columns", [...cols, { id: `col${cols.length + 1}`, label: `Column ${cols.length + 1}`, width: `160px` }]);
                                }
                              }}
                              className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          {(selectedField.columns?.length || 0) > 6 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded border border-amber-100 mt-1">
                              <AlertCircle size={10} className="text-amber-500" />
                              <span className="text-[9px] font-bold text-amber-600 leading-none">Best viewed up to 6 columns</span>
                            </div>
                          )}
                        </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Column Labels</label>
                      <div className="space-y-2">
                        {selectedField.columns?.map((col, i) => (
                          <div key={col.id || i} className="flex gap-2 items-center">
                            <span className="text-[10px] font-bold text-gray-300 w-5">{i + 1}</span>
                            <input 
                              value={col.label || ""}
                              onChange={(e) => {
                                const newCols = [...selectedField.columns];
                                newCols[i] = { ...newCols[i], label: e.target.value };
                                handleChange("columns", newCols);
                              }}
                              placeholder={`Column ${i + 1}`}
                              className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[12px] font-bold text-gray-700 block">Allow Add Rows</span>
                          <span className="text-[10px] text-gray-400">Users can add more rows</span>
                        </div>
                        <button 
                          onClick={() => handleChange("repeatable", !selectedField.repeatable)}
                          className={`w-10 h-5 rounded-full relative transition-all duration-200 ${selectedField.repeatable ? "bg-indigo-600" : "bg-gray-200"}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${selectedField.repeatable ? "left-5.5" : "left-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[12px] font-bold text-gray-700 block">Required Field</span>
                    <span className="text-[10px] text-gray-400">Must be filled to submit</span>
                  </div>
                  <button 
                    onClick={() => handleChange("required", !selectedField.required)}
                    className={`w-10 h-5 rounded-full relative transition-all duration-200 ${selectedField.required ? "bg-indigo-600" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${selectedField.required ? "left-5.5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}


          </AnimatePresence>
        </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-50">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          <span>Node ID</span>
          <span className="text-gray-500 font-mono select-all">#{selectedField.id.split('-')[1]}</span>
        </div>
      </div>
    </aside>
  );
}
