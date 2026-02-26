import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BasicInputs, ChecklistAndTables, SpecialFields } from './components';

const FormRenderer = ({
  form,
  formDefinition,
  fields,
  sections,
  onSubmit,
  submitting = false,
  readOnly = false,
  initialData,
  showSubmitButton = true,
  mode = 'fill',
  onDataChange
}) => {
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const isInitialRender = useRef(true);
  const lastNotifiedData = useRef({});

  // Initialize formData with initialData when it changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      let hasChanges = false;
      const newData = { ...formData };

      Object.keys(initialData).forEach(key => {
        if (JSON.stringify(formData[key]) !== JSON.stringify(initialData[key])) {
          hasChanges = true;
          newData[key] = initialData[key];
        }
      });

      if (hasChanges) {
        setFormData(newData);
      }
    }
  }, [initialData]);

  // Notify parent when formData changes
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (onDataChange && Object.keys(formData).length > 0) {
      const currentDataStr = JSON.stringify(formData);
      const lastDataStr = JSON.stringify(lastNotifiedData.current);

      if (currentDataStr !== lastDataStr) {
        const dataCopy = { ...formData };
        lastNotifiedData.current = dataCopy;
        onDataChange(dataCopy);
      }
    }
  }, [formData, onDataChange]);

  const handleChange = useCallback((fieldName, value) => {
    const fieldId = fieldName.fieldId || fieldName.id || fieldName;
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  const handleFileChange = (fieldName, fileList) => {
    const fieldId = fieldName.fieldId || fieldName.id || fieldName;
    const fileArray = Array.from(fileList);
    setFiles(prev => ({ ...prev, [fieldId]: fileArray }));

    setFormData(prev => {
      const newData = { ...prev, [fieldId]: fileArray.map(f => f.name) };
      if (onDataChange) {
        onDataChange(newData);
      }
      return newData;
    });
  };

  const renderField = useCallback((field, index) => {
    const key = field.fieldId || field.id || index;
    const fieldValue = formData[field.fieldId || field.id] || '';

    const commonProps = {
      field,
      value: fieldValue,
      onChange: handleChange,
      onFileChange: handleFileChange,
      update: handleChange,
      renderField,
      files,
      setFiles,
      uploadProgress,
      setUploadProgress,
      setFocusedField: () => {},
      customKey: key,
      inputClasses:
        'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 transition-colors',
      readOnly
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'time':
      case 'datetime-local':
      case 'month':
      case 'week':
      case 'tel':
      case 'url':
      case 'password':
      case 'textarea':
      case 'radio':
      case 'checkbox':
      case 'dropdown':
      case 'multi-select':
      case 'multiselect':
      case 'location':
      case 'barcode-scanner':
      case 'rich-text':
        return <BasicInputs key={key} {...commonProps} />;

      case 'checklist-row':
      case 'checklist':
      case 'grid-table':
      case 'columns-2':
      case 'columns-3':
        return <ChecklistAndTables key={key} {...commonProps} />;

      case 'file':
      case 'image':
      case 'signature':
      case 'auto-date':
      case 'auto-user':
      case 'terms':
        return <SpecialFields key={key} {...commonProps} />;

      default:
        return <BasicInputs key={key} {...commonProps} />;
    }
  }, [formData, handleChange, handleFileChange, files, setFiles, uploadProgress, setUploadProgress, readOnly]);

  const handleSubmit = e => {
    e.preventDefault();
    if (onSubmit) {
      const filesArray = Object.values(files).flat();
      onSubmit(formData, filesArray);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FIXED: normalizeFormFields
  // Only adds placeholder rows/columns when the field genuinely has NONE at all.
  // Never overwrites real data that came from the form builder / API.
  // ─────────────────────────────────────────────────────────────────────────────
  const normalizeFormFields = fields => {
    if (!fields || !Array.isArray(fields)) return [];

    return fields.map(field => {
      let processedField = { ...field };

      if (processedField.type === 'grid-table') {
        // ✅ SAFE: only inject a placeholder row when there are truly zero items
        if (!processedField.items || processedField.items.length === 0) {
          processedField.items = [
            { id: 'row-1', question: 'Row 1', label: 'Row 1' }
          ];
        }

        // ✅ SAFE: only inject a placeholder column when there are truly zero columns
        if (!processedField.columns || processedField.columns.length === 0) {
          processedField.columns = [
            { id: 'col-1', label: 'Column 1', width: '160px' }
          ];
        }
      }

      // Recursively normalize nested fields (e.g. columns-2 / columns-3 containers)
      if (processedField.fields && Array.isArray(processedField.fields)) {
        processedField.fields = normalizeFormFields(processedField.fields);
      }

      return processedField;
    });
  };

  // ── Determine which form definition to use ───────────────────────────────────
  let formToRender = formDefinition || form;

  if (fields) {
    formToRender = { fields, sections: sections || [] };
  }

  if (!formToRender || (!formToRender.fields && !formToRender.sections)) {
    return <div>No form data available</div>;
  }

  // ── Collect all fields (sections take priority over root fields) ─────────────
  let allFields = [];

  if (formToRender.sections && Array.isArray(formToRender.sections)) {
    formToRender.sections.forEach(section => {
      if (section.fields && Array.isArray(section.fields)) {
        allFields = [...allFields, ...section.fields];
      }
    });
  }

  if (formToRender.fields && Array.isArray(formToRender.fields)) {
    if (formToRender.sections && formToRender.sections.length > 0) {
      // Only include root fields that aren't already in a section
      const sectionFieldIds = new Set();
      formToRender.sections.forEach(section => {
        section.fields?.forEach(f => {
          if (f.fieldId) sectionFieldIds.add(f.fieldId);
        });
      });

      const uniqueRootFields = formToRender.fields.filter(
        f => f.fieldId && !sectionFieldIds.has(f.fieldId)
      );
      allFields = [...allFields, ...uniqueRootFields];
    } else {
      allFields = [...allFields, ...formToRender.fields];
    }
  }

  const normalizedFields = normalizeFormFields(allFields);

  return (
    <form onSubmit={onSubmit ? handleSubmit : undefined} className="form-renderer">
      <div className="space-y-4">
        {normalizedFields.map((field, index) => renderField(field, index))}
      </div>

      {onSubmit && showSubmitButton && !readOnly && (
        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      )}
    </form>
  );
};

export default FormRenderer;