import { useState, useCallback } from "react";
import { 
  AlertCircle, 
  CheckCircle2,
  AlertTriangle,
  Check
} from "lucide-react";

export default function BasicInputs({ 
  field, 
  customKey, 
  value, 
  error, 
  isFocused, 
  inputClasses,
  readOnly,
  update,
  setFocusedField
}) {
  const fieldId = field.fieldId || field.id || field.name;

  const handleInputChange = useCallback((e) => {
    update(fieldId, e.target.value);
  }, [fieldId, update]);

  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "phone":
      return (
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="relative">
            <input
              key={fieldId}
              type={field.type}
              value={value || ""}
              onChange={handleInputChange}
              onFocus={() => setFocusedField && setFocusedField(fieldId)}
              onBlur={() => setFocusedField && setFocusedField(null)}
              placeholder={field.placeholder}
              className={inputClasses}
              disabled={readOnly}
            />
            {value && !error && !readOnly && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {error && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "textarea":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <textarea
            value={value || ""}
            onChange={(e) => update(fieldId, e.target.value)}
            onFocus={() => setFocusedField(fieldId)}
            onBlur={() => setFocusedField(null)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={inputClasses}
            disabled={readOnly}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "radio":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="space-y-2">
            {field.options.map((option, idx) => (
              <label 
                key={idx} 
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${value === option 
                    ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${readOnly ? 'cursor-default' : ''}`}
              >
                <input
                  type="radio"
                  name={fieldId}
                  value={option}
                  checked={value === option}
                  onChange={(e) => update(fieldId, e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  disabled={readOnly}
                />
                <span className={`ml-3 ${value === option ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                  {option}
                </span>
                {value === option && (
                  <Check className="ml-auto w-5 h-5 text-indigo-600" />
                )}
              </label>
            ))}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "checkbox":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="space-y-2">
            {field.options.map((option, idx) => {
              const isChecked = Array.isArray(value) ? value.includes(option) : false;
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
                        update(fieldId, [...current, option]);
                      } else {
                        update(fieldId, current.filter(v => v !== option));
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={readOnly}
                  />
                  <span className={`ml-3 ${isChecked ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                    {option}
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

    case "dropdown":
    case "select":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="relative">
            <select
              value={value || ""}
              onChange={(e) => update(fieldId, e.target.value)}
              onFocus={() => setFocusedField(fieldId)}
              onBlur={() => setFocusedField(null)}
              className={inputClasses}
              disabled={readOnly}
            >
              <option value="">{field.placeholder || "Select an option"}</option>
              {field.options.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {value && !error && !readOnly && (
              <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" />
            )}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "date":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="relative">
            <input
              type="date"
              value={value || ""}
              onChange={(e) => update(fieldId, e.target.value)}
              onFocus={() => setFocusedField(fieldId)}
              onBlur={() => setFocusedField(null)}
              className={inputClasses}
              disabled={readOnly}
            />
            {value && !error && !readOnly && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" />
            )}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "datetime":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={value || ""}
              onChange={(e) => update(fieldId, e.target.value)}
              onFocus={() => setFocusedField(fieldId)}
              onBlur={() => setFocusedField(null)}
              className={inputClasses}
              disabled={readOnly}
            />
            {value && !error && !readOnly && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" />
            )}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "daterange":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
              <input
                type="date"
                value={value?.start || ""}
                onChange={(e) => update(fieldId, { ...value, start: e.target.value })}
                className={inputClasses}
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
              <input
                type="date"
                value={value?.end || ""}
                onChange={(e) => update(fieldId, { ...value, end: e.target.value })}
                className={inputClasses}
                disabled={readOnly}
              />
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

    default:
      return null;
  }
}