import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BasicInputs, ChecklistAndTables, SpecialFields } from './components';

const FormRenderer = ({ form, formDefinition, fields, sections, onSubmit, submitting = false, readOnly = false, initialData, showSubmitButton = true, mode = 'fill', onDataChange }) => {
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const isInitialRender = useRef(true);
  const lastNotifiedData = useRef({});

  // console.log('[FormRenderer] Props received:', { form, formDefinition, fields, sections, initialData, mode });
  // console.log('[FormRenderer] Current formData:', formData);

  // Initialize formData with initialData when it changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Only update if the data is actually different
      let hasChanges = false;
      const newData = { ...formData };
      
      Object.keys(initialData).forEach(key => {
        if (JSON.stringify(formData[key]) !== JSON.stringify(initialData[key])) {
          hasChanges = true;
          newData[key] = initialData[key];
        }
      });
      
      if (hasChanges) {
        // console.log('[FormRenderer] Initializing formData with initialData:', initialData);
        setFormData(newData);
      }
    }
  }, [initialData]);

  // Notify parent when formData changes
  useEffect(() => {
    // Skip notification on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Only notify parent if we actually have meaningful data changes
    if (onDataChange && Object.keys(formData).length > 0) {
      // Check if data has actually changed since last notification
      const currentDataStr = JSON.stringify(formData);
      const lastDataStr = JSON.stringify(lastNotifiedData.current);
      
      if (currentDataStr !== lastDataStr) {
        // Create a copy to avoid reference issues
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
    setFiles(prev => ({
      ...prev,
      [fieldId]: fileArray
    }));
    
    // Store file names in formData
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldId]: fileArray.map(f => f.name)
      };
      
      if (onDataChange) {
        console.log('[FormRenderer] handleFileChange onDataChange called for:', fieldId, newData[fieldId]);
        onDataChange(newData);
      }
      
      return newData;
    });
  };

  const renderField = useCallback((field, index) => {
    const key = field.fieldId || field.id || index;
    const fieldValue = formData[field.fieldId || field.id] || '';
    
    // Debug: Log each field being rendered
    console.log(`[FormRenderer] Rendering field ${index}:`, {
      label: field.label,
      type: field.type,
      fieldId: field.fieldId,
      key: key
    });
    
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
      inputClasses: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 transition-colors",
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
        return <BasicInputs key={key} {...commonProps} />;
            
      case 'radio':
      case 'checkbox':
      case 'dropdown':
      case 'multi-select':
      case 'multiselect':
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
      case 'terms':
        return <SpecialFields key={key} {...commonProps} />;
            
      case 'location':
      case 'barcode-scanner':
      case 'rich-text':
        return <BasicInputs key={key} {...commonProps} />;
            
      default:
        return <BasicInputs key={key} {...commonProps} />;
    };
  }, [formData, handleChange, handleFileChange, files, setFiles, uploadProgress, setUploadProgress, readOnly]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[FormRenderer] handleSubmit called with formData:', formData);
    if (onSubmit) {
      // Convert files object to array
      const filesArray = Object.values(files).flat();
      onSubmit(formData, filesArray);
    }
  };

  // Helper function to normalize form data - only enhance grid-table fields
  const normalizeFormFields = (fields) => {
    if (!fields || !Array.isArray(fields)) return [];
    
    return fields.map(field => {
      let processedField = { ...field };
      
      // Enhance grid-table fields to have at least one row if no items exist
      if (processedField.type === 'grid-table') {
        if (!processedField.items || processedField.items.length === 0) {
          // Create at least one row with default IDs
          processedField.items = [{ id: 'row-1', question: 'Row 1', label: 'Row 1' }];
        }
        if (!processedField.columns || processedField.columns.length === 0) {
          // Ensure there's at least one column if no columns exist
          processedField.columns = [{ id: 'col-1', label: 'Column 1' }];
        }
      }
      
      // If this field has nested fields, normalize them recursively
      if (processedField.fields && Array.isArray(processedField.fields)) {
        processedField.fields = normalizeFormFields(processedField.fields);
      }
      
      return processedField;
    });
  };
  
  // Determine which form data to use
  let formToRender = formDefinition || form;
  
  // If fields prop is provided, create a temporary form object
  if (fields) {
    formToRender = {
      fields: fields,
      sections: sections || []
    };
  }
  
  if (!formToRender || (!formToRender.fields && !formToRender.sections)) {
    return <div>No form data available</div>;
  }
  
  // Combine fields from all sections into a single array
  // This prevents duplication since fields might exist in both root fields[] and sections[].fields[]
  let allFields = [];
  
  // Add fields from sections
  if (formToRender.sections && Array.isArray(formToRender.sections)) {
    formToRender.sections.forEach(section => {
      if (section.fields && Array.isArray(section.fields)) {
        allFields = [...allFields, ...section.fields];
      }
    });
  }
  
  // Add root fields if they exist (for forms that have both root fields and sections)
  if (formToRender.fields && Array.isArray(formToRender.fields)) {
    // For forms with sections, we should prioritize section fields over root fields
    // But if a field exists in both root and section with same fieldId, we keep the section version
    // and only add root fields that don't exist in any section
    
    if (formToRender.sections && formToRender.sections.length > 0) {
      // If sections exist, root fields are typically legacy/backwards compatibility
      // Only add root fields that don't exist in any section
      const sectionFieldIds = new Set();
      formToRender.sections.forEach(section => {
        section.fields?.forEach(field => {
          if (field.fieldId) {
            sectionFieldIds.add(field.fieldId);
          }
        });
      });
      
      const uniqueRootFields = formToRender.fields.filter(field => 
        field.fieldId && !sectionFieldIds.has(field.fieldId)
      );
      
      allFields = [...allFields, ...uniqueRootFields];
    } else {
      // If no sections exist, use root fields as primary
      allFields = [...allFields, ...formToRender.fields];
    }
  }
  
  // Debug: Log the fields being processed
  console.log('[FormRenderer] Processing fields:', {
    totalRootFields: formToRender.fields?.length || 0,
    totalSectionFields: formToRender.sections?.reduce((sum, section) => sum + (section.fields?.length || 0), 0) || 0,
    combinedFields: allFields.length,
    fieldDetails: allFields.map(f => ({
      label: f.label,
      type: f.type,
      fieldId: f.fieldId
    }))
  });
  
  // Debug: Log duplicate field detection
  if (formToRender.fields && formToRender.sections && formToRender.sections.length > 0) {
    const sectionFieldIds = new Set();
    formToRender.sections.forEach(section => {
      section.fields?.forEach(field => {
        if (field.fieldId) {
          sectionFieldIds.add(field.fieldId);
        }
      });
    });
    
    const rootFieldsWithSameId = formToRender.fields.filter(field => 
      field.fieldId && sectionFieldIds.has(field.fieldId)
    );
    
    console.log('[FormRenderer] Duplicate fields (in both root and section):', 
      rootFieldsWithSameId.map(f => `${f.label} (${f.fieldId})`)
    );
  }
  
  // Normalize the combined fields to ensure layout containers have their nested fields
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
            className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      )}
    </form>
  );
};

export default FormRenderer;