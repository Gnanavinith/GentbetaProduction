import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import FieldEditor from "./FieldEditor";
import { generateFieldId, FIELD_TYPES } from "../../utils/fieldId";
import { formApi } from "../../api/form.api";
import { templateApi } from "../../api/template.api";
import { userApi } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import { Users, Plus, Trash2, ShieldCheck, Layout, ChevronDown, ChevronUp } from "lucide-react";

export default function FormBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formName, setFormName] = useState("");
  const [sections, setSections] = useState([
    { id: crypto.randomUUID(), title: "Default Section", fields: [] }
  ]);
  const [selectedFieldType, setSelectedFieldType] = useState("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateDescription, setTemplateDescription] = useState("");
  
  // Approval Flow State
  const [approvalFlow, setApprovalFlow] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId) {
      loadTemplate(templateId);
    }
    if (user?.plantId) {
      fetchEmployees();
    }
  }, [searchParams, user]);

  const fetchEmployees = async () => {
    const response = await userApi.getPlantEmployees(user.plantId);
    if (response.success) {
      setEmployees(response.data);
    }
  };

  const addApprover = () => {
    const nextLevel = approvalFlow.length + 1;
    setApprovalFlow([...approvalFlow, { level: nextLevel, approverId: "" }]);
  };

  const removeApprover = (index) => {
    const updated = approvalFlow.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, level: i + 1 }));
    setApprovalFlow(updated);
  };

  const updateApprover = (index, approverId) => {
    const updated = [...approvalFlow];
    updated[index].approverId = approverId;
    setApprovalFlow(updated);
  };

  const loadTemplate = async (templateId) => {
    try {
      const response = await templateApi.getTemplateById(templateId);
      if (response.success && response.data) {
        const template = response.data;
        setFormName(template.templateName);
        
        if (template.sections && template.sections.length > 0) {
          const sectionsWithIds = template.sections.map(section => ({
            ...section,
            id: crypto.randomUUID(),
            fields: section.fields.map(field => ({ ...field, id: crypto.randomUUID() }))
          }));
          setSections(sectionsWithIds);
        } else if (template.fields) {
          // Legacy template with flat fields
          setSections([{
            id: crypto.randomUUID(),
            title: "Main Section",
            fields: template.fields.map(field => ({ ...field, id: crypto.randomUUID() }))
          }]);
        }
      }
    } catch (err) {
      console.error("Failed to load template:", err);
      setError("Failed to load template");
    }
  };

  const addSection = () => {
    setSections([...sections, { id: crypto.randomUUID(), title: `Section ${sections.length + 1}`, fields: [] }]);
  };

  const updateSectionTitle = (sectionId, title) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, title } : s));
  };

  const deleteSection = (sectionId) => {
    if (sections.length === 1) {
      setError("Form must have at least one section");
      return;
    }
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const addField = (sectionId) => {
    const newField = {
      id: crypto.randomUUID(),
      label: "",
      fieldId: "",
      type: selectedFieldType,
      required: false
    };

    if (["radio", "checkbox", "dropdown", "multi-select"].includes(selectedFieldType)) {
      newField.options = ["Option 1", "Option 2"];
    } else if (selectedFieldType === "table") {
      newField.tableConfig = {
        rows: 2,
        columns: 2,
        headings: ["Col 1", "Col 2"]
      };
    }

    setSections(sections.map(s => s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s));
  };

  const updateField = (sectionId, fieldId, updated) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updated } : f) } 
        : s
    ));
  };

  const deleteField = (sectionId, fieldId) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } 
        : s
    ));
  };

  const handleFieldDragEnd = (sectionId, event) => {
    const { active, over } = event;
    if (active.id !== over.id && over) {
      const section = sections.find(s => s.id === sectionId);
      const oldIndex = section.fields.findIndex(f => f.id === active.id);
      const newIndex = section.fields.findIndex(f => f.id === over.id);
      
      const updatedFields = arrayMove(section.fields, oldIndex, newIndex);
      setSections(sections.map(s => s.id === sectionId ? { ...s, fields: updatedFields } : s));
    }
  };

  const handleSectionDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id && over) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const validateForm = () => {
    if (!formName.trim()) {
      setError("Please enter a form name");
      return false;
    }

    if (sections.every(s => s.fields.length === 0)) {
      setError("Please add at least one field to the form");
      return false;
    }

    // Skip the approval flow validation if no approval flow is provided
    if (approvalFlow && approvalFlow.length > 0) {
      for (const flow of approvalFlow) {
        if (!flow.approverId) {
          setError(`Please select an approver for Level ${flow.level}`);
          return false;
        }
      }
    }

    for (const section of sections) {
      if (!section.title.trim()) {
        setError("All sections must have a title");
        return false;
      }
      for (const field of section.fields) {
        if (!field.label || !field.label.trim()) {
          setError(`A field in section "${section.title}" is missing a label`);
          return false;
        }
        if (["radio", "checkbox", "dropdown", "multi-select"].includes(field.type)) {
          if (!field.options || field.options.length === 0 || field.options.some(opt => !opt.trim())) {
            setError(`Field "${field.label}" has invalid options`);
            return false;
          }
        }
      }
    }

    setError("");
    return true;
  };

  const saveForm = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cleanedSections = sections.map(section => ({
        sectionId: generateFieldId(section.title),
        title: section.title.trim(),
        fields: section.fields.map(field => {
          const { id: _id, ...rest } = field;
          return {
            ...rest,
            fieldId: rest.fieldId || generateFieldId(rest.label)
          };
        })
      }));

      // For backward compatibility and simple usage, we can also flatten fields
      const allFields = cleanedSections.flatMap(s => s.fields);

      const payload = {
        formName: formName.trim(),
        formId: generateFieldId(formName),
        sections: cleanedSections,
        // Only include root fields for legacy forms that don't use sections
        // Modern forms should use sections[].fields instead
        fields: [],
        approvalFlow: approvalFlow,
        isTemplate: true,
        status: "PUBLISHED"
      };

      const response = await formApi.createForm(payload);
        
      if (response.success) {
        if (saveAsTemplate) {
          await templateApi.createTemplate({
            templateName: formName.trim(),
            description: templateDescription.trim(),
            sections: cleanedSections,
            fields: allFields
          });
        }
        alert("Form saved successfully!");
        navigate("/plant/forms");
      } else {
        setError(response.message || "Failed to save form");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error saving form");
      console.error("Save form error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Default Company Header */}
        <CompanyHeader />

        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Form Designer
              </h2>
              <p className="text-sm text-gray-600 mt-1">Design multi-section forms with advanced logic</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Form Name
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none font-medium"
              placeholder="e.g., Daily Safety Audit"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-slide-down shadow-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Approval Flow Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Approval Workflow
            </h3>
            <button
              onClick={addApprover}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Approval Level
            </button>
          </div>

          <div className="space-y-4">
            {approvalFlow.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500">No approval levels added. This form will be auto-approved upon submission.</p>
              </div>
            ) : (
              approvalFlow.map((flow, index) => (
                <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md">
                    {flow.level}
                  </div>
                  <div className="flex-1">
                    <select
                      value={flow.approverId}
                      onChange={(e) => updateApprover(index, e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Approver</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.position})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => removeApprover(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sections Area */}
        <div className="space-y-8 mb-8">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section, sIndex) => (
                <div key={section.id} className="bg-white/60 backdrop-blur-sm rounded-3xl p-1 border-2 border-indigo-100 shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: `${sIndex * 100}ms` }}>
                  <div className="bg-white rounded-[22px] p-6 shadow-sm border border-indigo-50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                          {sIndex + 1}
                        </div>
                        <input 
                          className="text-xl font-bold bg-transparent border-b-2 border-transparent focus:border-indigo-500 outline-none px-2 py-1 flex-1 transition-all"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          placeholder="Section Title"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Field Type Selector for this section */}
                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex items-center gap-4">
                      <select
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none bg-white font-medium text-sm"
                        value={selectedFieldType}
                        onChange={(e) => setSelectedFieldType(e.target.value)}
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => addField(section.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all font-semibold flex items-center gap-2 text-sm whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        Add Field
                      </button>
                    </div>

                    <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleFieldDragEnd(section.id, e)}>
                      <SortableContext items={section.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                          {section.fields.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                              <p className="text-gray-400 text-sm">No fields in this section yet</p>
                            </div>
                          ) : (
                            section.fields.map((field, fIndex) => (
                              <FieldEditor
                                key={field.id}
                                field={field}
                                onChange={(updated) => updateField(section.id, field.id, updated)}
                                onDelete={() => deleteField(section.id, field.id)}
                              />
                            ))
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              ))}
            </SortableContext>
          </DndContext>

          <button
            onClick={addSection}
            className="w-full py-6 border-2 border-dashed border-indigo-300 rounded-3xl text-indigo-600 font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
            Add New Section
          </button>
        </div>

        {/* Save Options */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="saveAsTemplate"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="saveAsTemplate" className="text-sm font-semibold text-gray-700">
              Save as reusable template
            </label>
          </div>
          
          {saveAsTemplate && (
            <div className="mt-4 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Description (optional)
              </label>
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is used for..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 transition-all outline-none resize-none"
                rows={2}
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/plant/forms")}
            className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={saveForm}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold flex items-center gap-2"
            type="button"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Publish Form
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
