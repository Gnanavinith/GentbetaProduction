import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";

export default function ChecklistAndTables({
  field,
  customKey,
  value,
  error,
  inputClasses,
  readOnly,
  update
}) {
  const fieldId = field.fieldId || field.id || field.name;

  switch (field.type) {

    //──────────────────────────────────────────────────────────────────────────
    // CHECKLIST
    //─────────────────────────────────────────────────────────────────────────
    case "checklist":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            {field.label}
            {field.required && (
              <span className="text-red-500 text-lg leading-none">*</span>
            )}
          </label>

          <div className="space-y-2">
            {field.items?.map((item, idx) => {
              // Support both item.id and item.fieldId as the identifier
              const itemId = item.id || item.fieldId || String(idx);
              const isChecked = Array.isArray(value) ? value.includes(itemId) : false;

              return (
                <label
                  key={itemId}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isChecked
                      ? "bg-indigo-50 border-indigo-500 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                    ${readOnly ? "cursor-default" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => {
                      const current = Array.isArray(value) ? value : [];
                      update(
                        fieldId,
                        e.target.checked
                          ? [...current, itemId]
                          : current.filter(v => v !== itemId)
                      );
                    }}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={readOnly}
                  />
                  <span
                    className={`ml-3 ${
                      isChecked ? "font-semibold text-indigo-900" : "text-gray-700"
                    }`}
                  >
                    {item.question || item.label || item.name || `Item ${idx + 1}`}
                  </span>
                  {isChecked && (
                    <Check className="ml-auto w-5 h-5 text-indigo-600" />
                  )}
                </label>
              );
            })}
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    //─────────────────────────────────────────────────────────────────────────
    // GRID TABLE  ← main fix is here
    //─────────────────────────────────────────────────────────────────────────
    case "grid-table": {
      const columns = field.columns || [];
      const items   = field.items   || [];

      // Helper: resolve column label regardless of which key the API uses
      const getColLabel = (col, idx) =>
        col.label || col.header || col.name || col.title || `Column ${idx + 1}`;

      // Helper: resolve the stable key for a column (used for value storage)
      const getColKey = (col, idx) =>
        col.id || col.fieldId || `col-${idx}`;

      // Helper: resolve the stable key for a row
      const getItemKey = (item, idx) =>
        item.id || item.fieldId || `row-${idx}`;

      // Helper: resolve display text for a row
      const getItemLabel = (item, idx) =>
        item.question || item.label || item.name || item.title || `Row ${idx + 1}`;

      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            {field.label}
            {field.required && (
              <span className="text-red-500 text-lg leading-none">*</span>
            )}
          </label>

          {/* Outer wrapper: clip border + allow horizontal scroll */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ minWidth: Math.max(600, (columns.length + 1) * 160) + "px" }}
              >
                {/*── THEAD─────────────────────────────────────────────── */}
                <thead className="bg-gray-50">
                  <tr>
                    {/* Sticky "Question" column */}
                    <th
                      className="
                        px-4 py-3 text-left text-xs font-semibold text-gray-500
                        uppercase tracking-wider whitespace-nowrap
                        sticky left-0 bg-gray-50 z-10
                        border-b-2 border-r-2 border-gray-200
                        min-w-[160px]
                      "
                    >
                      Question
                    </th>

                    {columns.map((col, colIdx) => (
                      <th
                        key={getColKey(col, colIdx)}
                        className="
                          px-4 py-3 text-left text-xs font-semibold text-gray-500
                          uppercase tracking-wider whitespace-nowrap
                          border-b-2 border-r border-gray-200
                          min-w-[140px]
                        "
                      >
                        {/*✅ FIX: read whichever label key the API returns */}
                        {getColLabel(col, colIdx)}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/*── TBODY─────────────────────────────────────────────── */}
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-4 py-8 text-center text-sm text-gray-400 italic"
                      >
                        No rows defined
                      </td>
                    </tr>
                  ) : (
                    items.map((item, itemIdx) => {
                      const itemKey = getItemKey(item, itemIdx);

                      return (
                        <tr
                          key={itemKey}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Sticky question label */}
                          <td
                            className="
                              px-4 py-3 text-sm font-medium text-gray-800
                              whitespace-nowrap
                              sticky left-0 bg-white z-10
                              border-r-2 border-gray-200
                            "
                          >
                            {getItemLabel(item, itemIdx)}
                          </td>

                          {columns.map((col, colIdx) => {
                            const colKey   = getColKey(col, colIdx);
                            // ✅ FIX: look up value using the same key we write with
                            const cellVal  =
                              (typeof value === "object" && value !== null)
                                ? (value?.[itemKey]?.[colKey] ?? "")
                                : "";

                            return (
                              <td
                                key={colKey}
                                className="px-3 py-2 border-r border-gray-100"
                              >
                                <input
                                  type="text"
                                  value={cellVal}
                                  onChange={e => {
                                    // Build an immutable copy of the nested value map
                                    const current =
                                      typeof value === "object" && value !== null
                                        ? value
                                        : {};
                                    const newValue = {
                                      ...current,
                                      [itemKey]: {
                                        ...(current[itemKey] || {}),
                                        [colKey]: e.target.value
                                      }
                                    };
                                    update(fieldId, newValue);
                                  }}
                                  className="
                                    w-full px-3 py-2
                                    border border-gray-200 rounded-lg
                                    text-sm text-gray-800
                                    focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
                                    focus:outline-none
                                    transition-colors
                                    bg-white
                                    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                                  "
                                  placeholder={`Enter ${getColLabel(col, colIdx)}`}
                                  disabled={readOnly}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}