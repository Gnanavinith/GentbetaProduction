import OptionsEditor from "./OptionsEditor";
import TableEditor from "./TableEditor";
import { generateFieldId, FIELD_TYPES } from "../../utils/fieldId";

export default function FieldEditor({ field, onChange, onDelete }) {
  const hasOptions = ["radio", "checkbox", "dropdown", "multi-select"].includes(field.type);
  const isTable = field.type === "table";
  const hasNumericProps = ["number", "range"].includes(field.type);

  const update = (key, value) => {
    const updated = { ...field, [key]: value };
    if (key === "label") {
      updated.fieldId = generateFieldId(value);
    }
      if (key === "type") {
        const newHasOptions = ["radio", "checkbox", "dropdown", "multi-select"].includes(value);
        if (!newHasOptions) {
          delete updated.options;
        }

      if (value !== "table") {
        delete updated.tableConfig;
      }
      if (!hasNumericProps && !["number", "range"].includes(value)) {
        delete updated.min;
        delete updated.max;
        delete updated.step;
      }
    }
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 mb-4 transition-all duration-300 hover:border-indigo-200 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-800">Field Configuration</h4>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Field Label</label>
          <input
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
            placeholder="Enter field label"
            value={field.label || ""}
            onChange={(e) => update("label", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Field Type</label>
          <select
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none bg-white font-medium"
            value={field.type || "text"}
            onChange={(e) => update("type", e.target.value)}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={field.required || false}
            onChange={(e) => update("required", e.target.checked)}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">Required field</span>
        </label>

        {hasOptions && (
          <div>
            <label className="block text-sm font-medium mb-1">Options:</label>
            <OptionsEditor
              options={field.options || []}
              onChange={(opts) => update("options", opts)}
            />
          </div>
        )}

        {isTable && (
          <div>
            <label className="block text-sm font-medium mb-1">Table Configuration:</label>
            <TableEditor
              tableConfig={field.tableConfig || {}}
              onChange={(config) => update("tableConfig", config)}
            />
          </div>
        )}

        {hasNumericProps && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Min:</label>
              <input
                type="number"
                className="border p-2 w-full rounded"
                value={field.min || ""}
                onChange={(e) => update("min", e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Max:</label>
              <input
                type="number"
                className="border p-2 w-full rounded"
                value={field.max || ""}
                onChange={(e) => update("max", e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Step:</label>
              <input
                type="number"
                step="any"
                className="border p-2 w-full rounded"
                value={field.step || ""}
                onChange={(e) => update("step", e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        )}

        {field.type === "text" && (
          <div>
            <label className="block text-sm font-medium mb-1">Placeholder:</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              placeholder="Enter placeholder text"
              value={field.placeholder || ""}
              onChange={(e) => update("placeholder", e.target.value)}
            />
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Field ID: <code className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono text-xs">{field.fieldId || "auto-generated"}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
