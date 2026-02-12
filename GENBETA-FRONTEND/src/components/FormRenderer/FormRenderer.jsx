import React, { useState, useEffect } from 'react';
import { BasicInputs, ChecklistAndTables, LayoutAndStructure, SpecialFields } from './components';

const FormRenderer = ({ form, formDefinition, fields, sections, onSubmit, submitting = false, readOnly = false, initialData, showSubmitButton = true, mode = 'fill', onDataChange }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [files, setFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const handleChange = (fieldName, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldName]: value
      };
      if (onDataChange) {
        onDataChange(newData);
      }
      return newData;
    });
  };

  const handleFileChange = (fieldName, fileList) => {
    const fileArray = Array.from(fileList);
    setFiles(prev => ({
      ...prev,
      [fieldName]: fileArray
    }));
    
    // Store file names in formData
    setFormData(prev => ({
      ...prev,
      [fieldName]: fileArray.map(f => f.name)
    }));
  };

  const renderField = (field, index) => {
    const commonProps = {
      key: field.id || index,
      field,
      value: formData[field.name] || '',
      onChange: handleChange,
      onFileChange: handleFileChange,
      update: handleChange,
      renderField,
      files,
      setFiles,
      uploadProgress,
      setUploadProgress,
      setFocusedField: () => {},
      customKey: field.id || index,
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
      case 'color':
        return <BasicInputs {...commonProps} />;
          
      case 'select':
      case 'multiselect':
      case 'radio':
      case 'checkbox':
      case 'textarea':
        return <BasicInputs {...commonProps} />;
          
      case 'checklist':
      case 'grid-table':
        return <ChecklistAndTables {...commonProps} />;
            
      case 'section-header':
      case 'section-divider':
      case 'spacer':
      case 'columns-2':
      case 'columns-3':
        return <LayoutAndStructure {...commonProps} />;
          
      case 'signature':
      case 'file-upload':
      case 'image':
      case 'file':
      case 'auto-date':
      case 'description':
      case 'terms':
        return <SpecialFields {...commonProps} />;
            
      case 'location':
      case 'barcode-scanner':
      case 'rich-text':
        return <BasicInputs {...commonProps} />;
            
      default:
        return <BasicInputs {...commonProps} />;
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData, files);
    }
  };

  // Handle case where initialData changes externally
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Helper function to normalize form data by nesting fields inside layout containers
  const normalizeFormFields = (fields) => {
    if (!fields || !Array.isArray(fields)) return [];
    
    // First, try to detect and group fields that should be nested within layout containers
    const groupedFields = [];
    let i = 0;
    
    while (i < fields.length) {
      const field = fields[i];
      
      // If this is a layout field (columns-2, columns-3, etc.)
      if (['columns-2', 'columns-3', 'section-header', 'section-divider', 'spacer'].includes(field.type)) {
        const layoutField = { ...field };
        layoutField.fields = layoutField.fields || [];
        
        // Look ahead for fields that should be nested inside this layout
        i++;
        while (i < fields.length) {
          const nextField = fields[i];
          
          // If we encounter another layout field or section-related field, stop nesting
          if (['columns-2', 'columns-3', 'section-header', 'section-divider', 'spacer'].includes(nextField.type)) {
            // Put this field back to be processed in the outer loop
            i--; // Step back so the outer loop will process this field
            break;
          }
          
          // Add this field to the current layout's fields
          layoutField.fields.push(nextField);
          i++;
        }
        
        groupedFields.push(layoutField);
      } else {
        // Regular field, add directly
        groupedFields.push(field);
        i++;
      }
    }
    
    // Process the grouped fields to enhance grid-table and other special fields
    const normalizedFields = [];
    for (const field of groupedFields) {
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
      
      normalizedFields.push(processedField);
    }
    
    return normalizedFields;
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
  
  if (!formToRender || !formToRender.fields) {
    return <div>No form data available</div>;
  }
  
  // Normalize the fields to ensure layout containers have their nested fields
  const normalizedFields = normalizeFormFields(formToRender.fields);
  formToRender = { ...formToRender, fields: normalizedFields };

  return (
    <form onSubmit={onSubmit ? handleSubmit : undefined} className="form-renderer">
      <div className="space-y-4">
        {formToRender.fields.map((field, index) => renderField(field, index))}
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