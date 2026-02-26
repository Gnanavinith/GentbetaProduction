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
  const [activeTab, setActiveTab] = useState("settings");

  if (!selectedField) {
    return (
      <aside className="w-[320px] bg-white border-l border-gray-100 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
          <Settings size={32} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">Properties Inspector</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Select a field to edit its properties and validation.
        </p>
      </aside>
    );
  }

  const handleChange = (key, value) => {
    updateField(selectedField.id, { [key]: value });
  };

  // ── Shared helper: make a new column object ─────────────────────────────────
  // ✅ FIX: always save column names under the "label" key so ChecklistAndTables
  //         can read col.label without any fallback gymnastics.
  const makeColumn = (index, existingCount) => ({
    id: `col-${Date.now()}-${index}`,
    label: `Column ${existingCount + index + 1}`,   // ← always "label"
    width: "160px"
  });

  const makeRow = (index, existingCount) => ({
    id: `item-${Date.now()}-${index}`,
    question: `Row ${existingCount + index + 1}`
  });

  const tabs = [{ id: "settings", label: "Settings", icon: Settings }];

  // ── Toggle pill helper ──────────────────────────────────────────────────────
  const Toggle = ({ value, onChange }) => (
    <div
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full cursor-pointer transition-all ${
        value ? "bg-indigo-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${
          value ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </div>
  );

  const renderBasicSettings = () => (
    <>
      {/* Field Label */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Field Label
        </label>
        <input
          value={selectedField.label || ""}
          onChange={e => handleChange("label", e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
        />
      </div>

      {/* Placeholder (hidden for certain types) */}
      {![
        "section-header", "spacer", "signature", "checklist",
        "grid-table", "columns-2", "columns-3",
        "auto-date", "auto-user", "description"
      ].includes(selectedField.type) && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Placeholder
          </label>
          <input
            value={selectedField.placeholder || ""}
            onChange={e => handleChange("placeholder", e.target.value)}
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
          onChange={e => handleChange("helpText", e.target.value)}
          placeholder="Subtext for the field"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
        />
      </div>

      {/* Approval Email toggle */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Approval Email
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Include in email to approvers</span>
            <Toggle
              value={!!selectedField.includeInApprovalEmail}
              onChange={() =>
                handleChange("includeInApprovalEmail", !selectedField.includeInApprovalEmail)
              }
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">
          When enabled, this field's value will be included in approval emails.
        </p>
      </div>

      {/* Terms / Description content editor */}
      {["terms", "description"].includes(selectedField.type) && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Content / Text
          </label>
          <textarea
            value={selectedField.content || ""}
            onChange={e => handleChange("content", e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all resize-none custom-scrollbar"
            placeholder="Enter text content here..."
          />
        </div>
      )}

      {/* Width & Alignment */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Maximize2 size={11} /> Width
          </label>
          <select
            value={selectedField.width || "100%"}
            onChange={e => handleChange("width", e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
          >
            {["25%", "33%", "50%", "66%", "75%", "100%"].map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Alignment
          </label>
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
            {[
              { id: "left",   icon: AlignLeft   },
              { id: "center", icon: AlignCenter  },
              { id: "right",  icon: AlignRight   }
            ].map(align => (
              <button
                key={align.id}
                onClick={() => handleChange("alignment", align.id)}
                className={`flex-1 py-1 rounded-md flex items-center justify-center transition-all ${
                  selectedField.alignment === align.id
                    ? "bg-white text-indigo-600 shadow-sm border border-gray-100"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <align.icon size={13} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ── CHECKLIST options ────────────────────────────────────────────────────────
  const renderChecklistSettings = () => (
    <div className="space-y-4 pt-2">
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Checklist Items
        </label>
        <div className="space-y-2">
          {selectedField.items?.map((item, i) => (
            <div key={item.id || i} className="flex gap-2">
              <input
                value={item.question || ""}
                onChange={e => {
                  const newItems = [...selectedField.items];
                  newItems[i] = { ...newItems[i], question: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Checklist question..."
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
              />
              <button
                onClick={() =>
                  handleChange("items", selectedField.items.filter((_, idx) => idx !== i))
                }
                className="p-1.5 text-gray-300 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              handleChange("items", [
                ...(selectedField.items || []),
                { id: `item-${Date.now()}`, question: `New item ${(selectedField.items?.length || 0) + 1}` }
              ])
            }
            className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={12} /> ADD CHECKLIST ITEM
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-50">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Response Options
        </label>
        <div className="space-y-2">
          {selectedField.options?.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={opt}
                onChange={e => {
                  const newOpts = [...selectedField.options];
                  newOpts[i] = e.target.value;
                  handleChange("options", newOpts);
                }}
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
              />
              <button
                onClick={() =>
                  handleChange("options", selectedField.options.filter((_, idx) => idx !== i))
                }
                className="p-1.5 text-gray-300 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              handleChange("options", [
                ...(selectedField.options || []),
                `Option ${(selectedField.options?.length || 0) + 1}`
              ])
            }
            className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={12} /> ADD OPTION
          </button>
        </div>
      </div>
    </div>
  );

  // ── Dropdown / Radio / Checkbox options ─────────────────────────────────────
  const renderOptionsSettings = () => (
    <div className="space-y-3 pt-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Options Management
      </label>
      <div className="space-y-2">
        {selectedField.options?.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={opt}
              onChange={e => {
                const newOpts = [...selectedField.options];
                newOpts[i] = e.target.value;
                handleChange("options", newOpts);
              }}
              className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
            />
            <button
              onClick={() =>
                handleChange("options", selectedField.options.filter((_, idx) => idx !== i))
              }
              className="p-1.5 text-gray-300 hover:text-red-500"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            handleChange("options", [
              ...(selectedField.options || []),
              `Option ${(selectedField.options?.length || 0) + 1}`
            ])
          }
          className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus size={12} /> ADD OPTION
        </button>
      </div>
    </div>
  );

  // ── GRID TABLE configuration ─────────────────────────────────────────────────
  const renderGridTableSettings = () => {
    const currentCols  = selectedField.columns || [];
    const currentItems = selectedField.items   || [];

    return (
      <div className="space-y-4 pt-2 border-t border-gray-50">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Table Configuration
        </label>

        {/* Rows & Columns numeric controls */}
        <div className="grid grid-cols-2 gap-4">
          {/* ── ROWS counter ── */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Rows3 size={11} /> Rows
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentItems.length > 1) {
                    handleChange("items", currentItems.slice(0, -1));
                  }
                }}
                disabled={currentItems.length <= 1}
                className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={currentItems.length || 1}
                onChange={e => {
                  const newCount = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                  let newItems;
                  if (newCount > currentItems.length) {
                    newItems = [...currentItems];
                    for (let i = currentItems.length; i < newCount; i++) {
                      newItems.push(makeRow(i - currentItems.length, currentItems.length));
                    }
                  } else {
                    newItems = currentItems.slice(0, newCount);
                  }
                  handleChange("items", newItems);
                }}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 text-center focus:bg-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
              />
              <button
                onClick={() => {
                  if (currentItems.length < 50) {
                    handleChange("items", [
                      ...currentItems,
                      makeRow(0, currentItems.length)
                    ]);
                  }
                }}
                disabled={currentItems.length >= 50}
                className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ── COLUMNS counter ── */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Columns3 size={11} /> Columns
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentCols.length > 1) {
                    handleChange("columns", currentCols.slice(0, -1));
                  }
                }}
                disabled={currentCols.length <= 1}
                className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min="1"
                max="20"
                value={currentCols.length || 2}
                onChange={e => {
                  const newCount = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                  let newCols;
                  if (newCount > currentCols.length) {
                    newCols = [...currentCols];
                    for (let i = currentCols.length; i < newCount; i++) {
                      newCols.push(makeColumn(i - currentCols.length, currentCols.length));
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
                  if (currentCols.length < 10) {
                    handleChange("columns", [
                      ...currentCols,
                      makeColumn(0, currentCols.length)
                    ]);
                  }
                }}
                disabled={currentCols.length >= 20}
                className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
              >
                <Plus size={14} />
              </button>
            </div>
            {currentCols.length > 6 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded border border-amber-100 mt-1">
                <AlertCircle size={10} className="text-amber-500" />
                <span className="text-[9px] font-bold text-amber-600 leading-none">
                  Best viewed up to 6 columns
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Column label editors ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Column Labels
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (currentCols.length > 1) {
                    handleChange("columns", currentCols.slice(0, -1));
                  }
                }}
                disabled={currentCols.length <= 1}
                className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => {
                  if (currentCols.length < 20) {
                    handleChange("columns", [
                      ...currentCols,
                      makeColumn(0, currentCols.length)
                    ]);
                  }
                }}
                disabled={currentCols.length >= 20}
                className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {currentCols.map((col, i) => (
              <div key={col.id || i} className="flex gap-2 items-center">
                <span className="text-[10px] font-bold text-gray-300 w-5">{i + 1}</span>
                <input
                  // ✅ FIX: always read AND write col.label
                  value={col.label || ""}
                  onChange={e => {
                    const newCols = [...currentCols];
                    newCols[i] = { ...newCols[i], label: e.target.value };
                    handleChange("columns", newCols);
                  }}
                  placeholder={`Column ${i + 1}`}
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
                />
                {/* Delete column */}
                <button
                  onClick={() => {
                    if (currentCols.length > 1) {
                      handleChange("columns", currentCols.filter((_, idx) => idx !== i));
                    }
                  }}
                  disabled={currentCols.length <= 1}
                  className="p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                </button>
                {/* Insert column before this one */}
                <button
                  onClick={() => {
                    const newCols = [...currentCols];
                    newCols.splice(i, 0, {
                      id: `col-${Date.now()}-inserted-${i}`,
                      label: `New Column ${i + 1}`,
                      width: "160px"
                    });
                    handleChange("columns", newCols);
                  }}
                  title="Insert column before"
                  className="p-1.5 text-gray-300 hover:text-green-500"
                >
                  <Plus size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row label editors ── */}
        <div className="space-y-3 pt-4 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Table Rows
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (currentItems.length > 1) {
                    handleChange("items", currentItems.slice(0, -1));
                  }
                }}
                disabled={currentItems.length <= 1}
                className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => {
                  if (currentItems.length < 50) {
                    handleChange("items", [
                      ...currentItems,
                      makeRow(0, currentItems.length)
                    ]);
                  }
                }}
                disabled={currentItems.length >= 50}
                className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {currentItems.map((item, i) => (
              <div key={item.id || i} className="flex gap-2">
                <span className="text-[10px] font-bold text-gray-300 w-5">{i + 1}</span>
                <input
                  value={item.question || ""}
                  onChange={e => {
                    const newItems = [...currentItems];
                    newItems[i] = { ...newItems[i], question: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Row question..."
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:border-indigo-300 outline-none"
                />
                {/* Delete row */}
                <button
                  onClick={() => {
                    if (currentItems.length > 1) {
                      handleChange("items", currentItems.filter((_, idx) => idx !== i));
                    }
                  }}
                  disabled={currentItems.length <= 1}
                  className="p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                </button>
                {/* Insert row above */}
                <button
                  onClick={() => {
                    const newItems = [...currentItems];
                    newItems.splice(i, 0, {
                      id: `item-${Date.now()}-inserted-${i}`,
                      question: `New Row ${i + 1}`
                    });
                    handleChange("items", newItems);
                  }}
                  title="Insert row above"
                  className="p-1.5 text-gray-300 hover:text-green-500"
                >
                  <Plus size={12} />
                </button>
              </div>
            ))}

            <button
              onClick={() =>
                handleChange("items", [
                  ...currentItems,
                  makeRow(0, currentItems.length)
                ])
              }
              className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={12} /> ADD ROW
            </button>
          </div>
        </div>

        {/* Allow Add Rows toggle */}
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[12px] font-bold text-gray-700 block">Allow Add Rows</span>
              <span className="text-[10px] text-gray-400">Users can add more rows</span>
            </div>
            <Toggle
              value={!!selectedField.repeatable}
              onChange={() => handleChange("repeatable", !selectedField.repeatable)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[320px] bg-white border-l border-gray-100 flex flex-col shrink-0 z-20 overflow-hidden shadow-[-4px_0_20px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-bold text-gray-900 leading-none mb-1">
            Properties Inspector
          </h3>
          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
            {selectedField.type}
          </span>
        </div>
        <button
          onClick={() => deleteField(selectedField.id)}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Delete Field"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Tab bar */}
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

      {/* Scrollable body */}
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

              {selectedField.type === "checklist"                           && renderChecklistSettings()}
              {["dropdown","radio","checkbox"].includes(selectedField.type) && renderOptionsSettings()}
              {selectedField.type === "grid-table"                          && renderGridTableSettings()}

              {/* Required field toggle (global) */}
              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[12px] font-bold text-gray-700 block">Required Field</span>
                    <span className="text-[10px] text-gray-400">Must be filled to submit</span>
                  </div>
                  <Toggle
                    value={!!selectedField.required}
                    onChange={() => handleChange("required", !selectedField.required)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-50">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          <span>Node ID</span>
          <span className="text-gray-500 font-mono select-all">
            #{selectedField.id?.split("-")[1] || selectedField.id}
          </span>
        </div>
      </div>
    </aside>
  );
}