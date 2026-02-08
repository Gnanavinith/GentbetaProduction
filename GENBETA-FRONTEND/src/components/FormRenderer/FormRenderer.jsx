import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { submissionApi } from "../../api/submission.api";
import api from "../../api/api";
import { 
  Save, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  FileText, 
  CheckCircle2,
  RotateCcw,
  Upload,
  Clock,
  UserCheck,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  X
} from "lucide-react";
import SignaturePad from "../forms/ModernFormBuilder/components/SignaturePad";
import { useAuth } from "../../context/AuthContext";

export default function FormRenderer({ 
  form, 
  fields: externalFields, 
  onSubmit: externalOnSubmit, 
  onDataChange,
  submitting: externalSubmitting,
  initialData = {},
  readOnly = false
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(initialData);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper function to find field value in data when direct matching fails
  const findFieldValue = (data, field) => {
    if (!data || typeof data !== 'object') return undefined;
    
    // Look for the field by various possible identifiers
    const possibleKeys = [
      field.fieldId,
      field.id,
      field.label?.toLowerCase().replace(/\s+/g, '_'),
      field.label?.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
      field.label,
      field.name,
      field.label?.toLowerCase().replace(/\s+/g, '-')
    ];
    
    // Remove duplicates and null/undefined values
    const uniqueKeys = [...new Set(possibleKeys.filter(Boolean))];
    
    // First, try direct matching
    for (const key of uniqueKeys) {
      if (data.hasOwnProperty(key)) {
        return data[key];
      }
    }
    
    // If not found, try partial matching or look for signature-like values
    if (field.type === 'signature') {
      // Look for signature values in the data
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && 
            (value.includes('cloudinary') || value.includes('signature') || value.includes('.png') || value.includes('data:image'))) {
          return value;
        }
        // Also check if value is an object that might contain signature data
        if (typeof value === 'object' && value !== null) {
          const objValues = Object.values(value);
          for (const objValue of objValues) {
            if (typeof objValue === 'string' &&
                (objValue.includes('cloudinary') || objValue.includes('signature') || objValue.includes('.png') || objValue.includes('data:image'))) {
              return objValue;
            }
          }
        }
      }
      
      // Check if any value in the data object is a string that looks like a signature URL
      const allValues = getAllObjectValues(data);
      for (const value of allValues) {
        if (typeof value === 'string' &&
            (value.includes('cloudinary') || value.includes('signature') || value.includes('.png') || value.includes('data:image'))) {
          return value;
        }
      }
    }
    
    return undefined;
  };
  
  // Helper function to recursively get all values from an object
  const getAllObjectValues = (obj) => {
    const values = [];
    
    const extractValues = (current) => {
      if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        for (const key in current) {
          if (current.hasOwnProperty(key)) {
            const value = current[key];
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              extractValues(value);
            } else {
              values.push(value);
            }
          }
        }
      } else if (Array.isArray(current)) {
        current.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            extractValues(item);
          } else {
            values.push(item);
          }
        });
      } else {
        values.push(current);
      }
    };
    
    extractValues(obj);
    return values;
  };

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setData(initialData);
    }
  }, [initialData]);

  const fields = externalFields || form?.fields || [];
  const sections = form?.sections || [];
  const isLoading = externalSubmitting !== undefined ? externalSubmitting : loading;
  
  const update = (id, value) => {
    setData(prev => ({ ...prev, [id]: value }));
    if (onDataChange) onDataChange({ ...data, [id]: value });
  };

  const addFile = async (id, file) => {
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result;
          
          // Upload to Cloudinary
          const uploadResponse = await api.post('/api/upload/image', {
            base64,
            folder: 'submissions'
          });
          
          // Store the Cloudinary URL
          setFiles(prev => ({ ...prev, [id]: { ...file, url: uploadResponse.data.url } }));
          update(id, uploadResponse.data.url);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload file');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
    }
  };

  const removeFile = (id) => {
    const newFiles = { ...files };
    delete newFiles[id];
    setFiles(newFiles);
    update(id, "");
  };

  const validateAll = () => {
    let newErrors = {};
    let hasError = false;

    // Validate fields
    [...fields, ...sections.flatMap(s => s.fields || [])].forEach(field => {
      const fieldId = field.fieldId || field.id;
      if (fieldId) {
        const val = data[fieldId];
        if (field.required) {
          if (field.type === "file" || field.type === "image") {
            if (!val || !files[fieldId]) {
              newErrors[fieldId] = "This field is required";
              hasError = true;
            }
          } else if (field.type === "signature") {
            if (!val) {
              newErrors[fieldId] = "Signature is required";
              hasError = true;
            }
          } else if (field.type === "daterange") {
            if (!val || !val.start || !val.end) {
              newErrors[fieldId] = "Both start and end dates are required";
              hasError = true;
            }
          } else if (!val || (Array.isArray(val) && val.length === 0)) {
            newErrors[fieldId] = "This field is required";
            hasError = true;
          }
        }
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateAll()) return;

    if (externalOnSubmit) {
      await externalOnSubmit(data, Object.values(files));
      return;
    }

    setLoading(true);
    try {
      const response = await submissionApi.createSubmission(form._id, data, "PENDING_APPROVAL");
      if (response.success) {
        navigate("/employee/submissions");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, customKey) => {
    const fieldId = field.fieldId || field.id;
    const error = errors[fieldId];
    // Try multiple possible keys to handle potential field ID mismatches
    const rawValue = data[fieldId] || 
              data[field.id] || 
              data[field.fieldId] || 
              data[field.label?.toLowerCase().replace(/\s+/g, '_')] || 
              data[field.name] ||
              // Additional fallbacks for potential field mapping issues
              findFieldValue(data, field);
    
    // Debug logging for signature fields
    if (field.type === 'signature') {
      console.log(`Signature field: ${field.label || fieldId}, rawValue:`, rawValue, 'from data:', data);
    }
    
    // Process rawValue to handle stringified objects
    let processedValue = rawValue;
    if (typeof rawValue === 'string' && rawValue.startsWith('{') && rawValue.endsWith('}')) {
      try {
        const parsed = JSON.parse(rawValue);
        // If it's a valid object, try to extract signature URL from it
        if (typeof parsed === 'object' && parsed !== null) {
          processedValue = parsed.url || parsed.secure_url || parsed.data || rawValue;
        }
      } catch (e) {
        // If parsing fails, keep the original value
        processedValue = rawValue;
      }
    }
    
    const val = readOnly ? (processedValue ?? '—') : (processedValue ?? '');
    
    const alignmentClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    }[field.alignment || "left"];

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "phone":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={val || ""}
              onChange={(e) => update(fieldId, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              disabled={readOnly}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={val || ""}
              onChange={(e) => update(fieldId, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              disabled={readOnly}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map((option, idx) => (
                <label key={idx} className="flex items-center">
                  <input
                    type="radio"
                    name={fieldId}
                    value={option}
                    checked={val === option}
                    onChange={(e) => update(fieldId, e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    disabled={readOnly}
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map((option, idx) => (
                <label key={idx} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Array.isArray(val) ? val.includes(option) : false}
                    onChange={(e) => {
                      const current = Array.isArray(val) ? val : [];
                      if (e.target.checked) {
                        update(fieldId, [...current, option]);
                      } else {
                        update(fieldId, current.filter(v => v !== option));
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                    disabled={readOnly}
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "dropdown":
      case "select":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={val || ""}
              onChange={(e) => update(fieldId, e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              disabled={readOnly}
            >
              <option value="">{field.placeholder || "Select an option"}</option>
              {field.options.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "file":
      case "image":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {val ? (
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {(field.type === "image") ? (
                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-sm text-gray-600 truncate max-w-xs">{val.split("/").pop()}</span>
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => removeFile(fieldId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                {readOnly && (
                  <div className="text-xs text-blue-600 break-all bg-blue-50 p-2 rounded border">
                    <span className="font-medium">File URL:</span> 
                    <a 
                      href={val} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800 break-all"
                    >
                      {val}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 mt-4">
                  <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload {field.type === "image" ? "an image" : "a file"}</span>
                    <input
                      type="file"
                      accept={field.type === "image" ? "image/*" : "*/*"}
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          addFile(fieldId, e.target.files[0]);
                        }
                      }}
                      disabled={readOnly}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {field.maxFileSize ? `Max file size: ${field.maxFileSize}MB` : (field.type === "image" ? "JPG, PNG, GIF up to 10MB" : "PNG, JPG, PDF up to 10MB")}
                </p>
              </div>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "signature":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {readOnly && val ? (
              <div className="space-y-2">
                <div className="p-4 bg-gray-50 rounded-lg border min-h-[150px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">Signature Image Preview</div>
                    <img 
                      src={val} 
                      alt="Signature" 
                      className="max-h-24 max-w-xs border border-gray-200 rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-gray-500">Unable to load signature image</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600 break-all bg-blue-50 p-2 rounded border">
                  <span className="font-medium">Signature URL:</span> 
                  <a 
                    href={val} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800 break-all"
                  >
                    {val}
                  </a>
                </div>
              </div>
            ) : (
              <SignaturePad
                value={val}
                onChange={(value) => update(fieldId, value)}
                disabled={readOnly}
              />
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={val || ""}
              onChange={(e) => update(fieldId, e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              disabled={readOnly}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "datetime":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="datetime-local"
              value={val || ""}
              onChange={(e) => update(fieldId, e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              disabled={readOnly}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "daterange":
        return (
          <div key={customKey} className={`mb-6 ${alignmentClass}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={val?.start || ""}
                  onChange={(e) => update(fieldId, { ...val, start: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={val?.end || ""}
                  onChange={(e) => update(fieldId, { ...val, end: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={readOnly}
                />
              </div>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "section-header":
        return (
          <div key={customKey} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              {field.description}
            </h2>
          </div>
        );

      case "section-divider":
        return (
          <div key={customKey} className="my-8 border-t border-gray-200"></div>
        );

      case "spacer":
        return (
          <div key={customKey} style={{ height: field.height || "20px" }}></div>
        );

      default:
        return null;
    }
  };

  if (!form && !externalFields) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No form data</h3>
          <p className="mt-1 text-sm text-gray-500">The form could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Approval Workflow Display */}
      {form?.approvalFlow && form.approvalFlow.length > 0 && (
        <div className="mb-10 bg-slate-50 rounded-3xl p-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Approval Workflow</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {form.approvalFlow.length} LEVEL{form.approvalFlow.length > 1 ? 'S' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {form.approvalFlow.map((level, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white pl-2 pr-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                    {idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
                      {level.name || `Approval Level ${idx + 1}`}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">
                      {level.approverId?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
                {idx < form.approvalFlow.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.length > 0 ? (
          sections.map((section, sectionIndex) => (
            <div key={section.sectionId || sectionIndex}>
              {section.title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-indigo-500 pl-4">
                  {section.title}
                </h2>
              )}
              <div className="space-y-6">
                {section.fields?.map((field, fieldIndex) => 
                  renderField(field, field.id || `section-${sectionIndex}-field-${fieldIndex}`)
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-6">
            {fields.map((field, index) => renderField(field, field.id || `field-${index}`))}
          </div>
        )}

        {!readOnly && (
          <div className="mt-12 flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => {
                setData(initialData);
                setFiles({});
                setErrors({});
              }}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  SUBMIT FORM
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}