import { useState } from "react";
import { 
  AlertTriangle,
  Check
} from "lucide-react";

export default function ChecklistAndTables({ 
  field, 
  customKey, 
  value, 
  error, 
  inputClasses,
  readOnly,
  update
}) {
  const fieldId = field.fieldId || field.id;

  switch (field.type) {
    case "checklist":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="space-y-2">
            {field.items?.map((item, idx) => {
              const isChecked = Array.isArray(value) ? value.includes(item.id) : false;
              return (
                <label 
                  key={idx} 
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isChecked 
                      ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${readOnly ? 'cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const current = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        update(fieldId, [...current, item.id]);
                      } else {
                        update(fieldId, current.filter(v => v !== item.id));
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={readOnly}
                  />
                  <span className={`ml-3 ${isChecked ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                    {item.question || item.label || `Item ${idx + 1}`}
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

    case "grid-table":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                  {field.columns?.map((col, colIdx) => (
                    <th key={colIdx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {field.items?.map((item, itemIdx) => (
                  <tr key={itemIdx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.question || item.label || `Row ${itemIdx + 1}`}
                    </td>
                    {field.columns?.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3">
                        <input
                          type="text"
                          value={value?.[item.id]?.[col.id] || ""}
                          onChange={(e) => {
                            const newValue = { ...value };
                            if (!newValue[item.id]) newValue[item.id] = {};
                            newValue[item.id][col.id] = e.target.value;
                            update(fieldId, newValue);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={readOnly}
                          placeholder={`Enter ${col.label || 'value'}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}