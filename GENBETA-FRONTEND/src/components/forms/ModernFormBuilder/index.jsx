import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from "@dnd-kit/core";
import { 
  arrayMove, 
  sortableKeyboardCoordinates, 
} from "@dnd-kit/sortable";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { INITIAL_FIELD_CONFIG } from "./constants";
import { formApi } from "../../../api/form.api";
import { useAuth } from "../../../context/AuthContext";
import { logError } from "../../../utils/errorHandler";

// Modularized Components
import { FacilityBuilderHeader } from "./components/FormBuilderHeader";
import { InitializingOverlay } from "./components/InitializingOverlay";
import { DesignerView } from "./components/DesignerView";
import { WorkflowView } from "./components/WorkflowView";
import { PreviewView } from "./components/PreviewView";

export default function ModernFacilityBuilder({ formId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { view: activeViewFromParams } = useParams();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    if (!activeViewFromParams) {
      const basePath = formId && formId !== "new" && formId !== "create" 
        ? `/plant/forms/${formId}/edit` 
        : `/plant/forms/create`;
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
      navigate(`${basePath}/designer${queryString}`, { replace: true });
    }
  }, [activeViewFromParams, formId, navigate, searchParams]);

  const activeView = activeViewFromParams || "designer";
  
  const setActiveView = useCallback((view) => {
    const basePath = formId && formId !== "new" && formId !== "create" 
      ? `/plant/forms/${formId}/edit` 
      : `/plant/forms/create`;
    
    // Preserve search params (like name) if any
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
    navigate(`${basePath}/${view}${queryString}`);
  }, [FacilityId, searchParams, navigate]);

  // Determine if this is a template creation based on URL params
  const isTemplateMode = searchParams.get("isTemplate") === "true" || searchParams.get("fromTemplate") || searchParams.get("template");
  const templateId = searchParams.get("template") || searchParams.get("fromTemplate");

  const [FacilityName, setFacilityName] = useState(searchParams.get("name") || "Untitled Facility");
  const [description, setDescription] = useState("Facility template description");
  const [sections, setSections] = useState([
    { id: "section-1", title: "General Information", fields: [] }
  ]);
  const [workflow, setWorkflow] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [status, setStatus] = useState("DRAFT");
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadDone = useRef(false);

  // Refs for auto-save and unmount handling
  const stateRef = useRef({ sections, workflow, formName, description, isDirty, formId, status });
  const saveInProgress = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    stateRef.current = { sections, workflow, formName, description, isDirty, formId, status };
  }, [sections, workflow, formName, description, isDirty, formId, status]);

  // Handle auto-save on change and on unmount - ONLY for new forms
  useEffect(() => {
    // 5-second debounce for auto-save during editing
    const timer = setTimeout(() => {
      if (stateRef.current.isDirty && !saveInProgress.current) {
        const isNew = !stateRef.current.formId || stateRef.current.formId === "new" || stateRef.current.formId === "create";
        
        // Only auto-save for NEW forms, not for editing existing forms
        if (isNew) {
          handleSave(false, true); // This will create a new draft
        }
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [sections, workflow, formName, description]);

  // Special effect for saving on unmount - ONLY save drafts for new forms, NOT for edits to published forms
  useEffect(() => {
    return () => {
      if (stateRef.current.isDirty && !saveInProgress.current) {
        const { sections, workflow, formName, description, formId, status: currentStatus } = stateRef.current;
        
        const isNew = !formId || formId === "new" || formId === "create";
        
        // Only auto-save drafts for NEW forms, don't modify existing published forms
        if (isNew) {
          const generatedFacilityId = `${formName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(100000 + Math.random() * 900000)}`;
                
          const payload = {
            formName: formName.trim(),
            description: description.trim(),
            formId: generatedFacilityId,
            status: "DRAFT", // Always create new forms as drafts
            isTemplate: isTemplateMode,
            sections: sections.map(s => ({
              sectionId: s.id,
              title: s.title,
              fields: s.fields.map(f => {
                const { id: _id, ...rest } = f;
                return {
                  ...rest,
                  fieldId: f.fieldId || f.label.toLowerCase().replace(/\s+/g, '_')
                };
              })
            })),
            // Only include root fields for legacy forms that don't use sections
            // Modern forms should use sections[].fields instead
            fields: [],
            approvalLevels: workflow,
            plantId: user?.plantId
          };

          formApi.createFacility(payload).catch(e => {
            logError("Unmount create", e);
            if (e.response?.data?.overLimit) {
              toast.error("Your form limit is reached. Contact admin");
            }
          });
        }
        // For existing forms (including published ones), don't auto-save on unmount
        // This preserves the original published form status
      }
    };
  }, [user?.plantId, isTemplateMode]);

  useEffect(() => {
    if (initialLoadDone.current) {
      setIsDirty(true);
    }
  }, [FacilityName, description]);

  useEffect(() => {
    if (formId && formId !== "new" && formId !== "create") {
      loadFacility();
    } else if (templateId && !formId) {
      // Load template if creating from template
      loadTemplate(templateId);
    }
  }, [FacilityId, templateId]);

  const loadTemplate = useCallback(async (templateId) => {
    try {
      setFetching(true);
      // Try loading as modern form template first
      const formResponse = await formApi.getFacilityById(templateId);
      if (formResponse && formResponse.data) {
        const template = formResponse.data;
        setFacilityName(template.formName || "Untitled Facility");
        setDescription(template.description || "");
        if (template.sections && template.sections.length > 0) {
          setSections(template.sections.map(s => ({
            ...s,
            id: s.id || `section-${Math.random().toString(36).substr(2, 9)}`,
            fields: (s.fields || []).map(f => ({
              ...f,
              id: f.id || `field-${Math.random().toString(36).substr(2, 9)}`
            }))
          })));
        }
        if (template.approvalFlow && template.approvalFlow.length > 0) {
          setWorkflow(template.approvalFlow.map(l => ({
            id: l._id || `level-${l.level}-${Math.random()}`,
            name: l.name || `Approval Level ${l.level}`,
            approverId: l.approverId?._id || l.approverId || "",
            description: l.description || ""
          })));
        }
        initialLoadDone.current = true;
        return;
      }
      // Fallback to legacy template API
      const { templateApi } = await import("../../../api/template.api");
      const templateResponse = await templateApi.getTemplateById(templateId);
      if (templateResponse && templateResponse.data) {
        const template = templateResponse.data;
        setFacilityName(template.templateName || "Untitled Facility");
        setDescription(template.description || "");
        if (template.sections && template.sections.length > 0) {
          setSections(template.sections.map(s => ({
            ...s,
            id: s.id || `section-${Math.random().toString(36).substr(2, 9)}`,
            fields: (s.fields || []).map(f => ({
              ...f,
              id: f.id || `field-${Math.random().toString(36).substr(2, 9)}`
            }))
          })));
        }
        initialLoadDone.current = true;
      }
    } catch (err) {
      logError("Load template", err);
      toast.error("Failed to load template");
    } finally {
      setFetching(false);
    }
  }, []);

  const loadFacility = useCallback(async () => {
    try {
      setFetching(true);
      const response = await formApi.getFacilityById(formId);
      if (response && response.data) {
        const form = response.data;
        setFacilityName(form.formName || "New project");
        setDescription(form.description || "");
        
        // Map approvalFlow from backend to workflow for frontend
        if (form.approvalFlow && form.approvalFlow.length > 0) {
          setWorkflow(form.approvalFlow.map(l => ({
            id: l._id || `level-${l.level}-${Math.random()}`,
            name: l.name || `Approval Level ${l.level}`,
            approverId: l.approverId?._id || l.approverId || "",
            description: l.description || ""
          })));
        } else {
          setWorkflow([]);
        }

        setStatus(form.status || "DRAFT");
        if (form.sections && form.sections.length > 0) {
          setSections(form.sections.map(s => ({
            ...s,
            id: s.id || `section-${Math.random().toString(36).substr(2, 9)}`,
            fields: (s.fields || []).map(f => ({
              ...f,
              id: f.id || `field-${Math.random().toString(36).substr(2, 9)}`
            }))
          })));
        }
        setIsDirty(false); // Reset dirty flag after loading
        initialLoadDone.current = true;
      }
    } catch (err) {
      logError("Load form", err);
      toast.error("Failed to load form data");
    } finally {
      setFetching(false);
    }
  }, [FacilityId]);

  const handleSave = useCallback(async (isPublish = false, silent = false, overrideStatus = null) => {
    if (!formName.trim()) {
      if (!silent) toast.error("Please enter a form name");
      return;
    }

    if (isPublish) {
      // Validate workflow levels only on publish if workflow exists
      if (workflow && workflow.length > 0) {
        const incompleteLevel = workflow.find(l => !l.approverId);
        if (incompleteLevel) {
          toast.error("Please assign an approver to all workflow levels");
          setActiveView("workflow");
          return;
        }
      }
    }

    try {
      saveInProgress.current = true;
      if (!silent) setLoading(true);
      setSaveStatus("Saving...");
      
      const isNew = !formId || formId === "new" || formId === "create";
      const isEditingPublished = !isNew && status === "PUBLISHED" && !isPublish;
      
      // For editing published forms, create a new draft instead of updating the original
      const shouldCreateNewDraft = isEditingPublished;
      
      // Generate formId - always create new ID for drafts of published forms
      const generatedFacilityId = shouldCreateNewDraft || isNew 
        ? `${formName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(100000 + Math.random() * 900000)}`
        : formId;
            
      const payload = {
        formName: formName.trim(),
        description: description.trim(),
        formId: generatedFacilityId,
        status: overrideStatus || (isPublish ? "PUBLISHED" : "DRAFT"),
        isTemplate: isTemplateMode,
        sections: sections.map(s => ({
          sectionId: s.id,
          title: s.title,
          fields: s.fields.map(f => {
            const { id: _id, ...rest } = f;
            return {
              ...rest,
              fieldId: f.fieldId || f.label.toLowerCase().replace(/\s+/g, '_')
            };
          })
        })),
        fields: sections.flatMap(s => s.fields.map(f => ({
          ...f,
          fieldId: f.fieldId || f.label.toLowerCase().replace(/\s+/g, '_')
        }))),
        approvalLevels: workflow,
        plantId: user?.plantId
      };

      let response;
      
      if (shouldCreateNewDraft) {
        // Create new draft version instead of updating published form
        response = await formApi.createFacility(payload);
      } else if (!isNew) {
        // Update existing draft/other status forms
        response = await formApi.updateFacility(formId, payload);
      } else {
        // Create new form
        response = await formApi.createFacility(payload);
      }

      if (response.success) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSaveStatus(`Saved at ${timeStr}`);
        setStatus(isPublish ? "PUBLISHED" : "DRAFT");
        setIsDirty(false);

        // If it was a new form or new draft from published form, update the URL
        if ((isNew || shouldCreateNewDraft) && response.data?._id) {
          const newId = response.data._id;
          const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
          navigate(`/plant/forms/${newId}/edit/${activeView}${queryString}`, { replace: true });
        }

        if (!silent) {
          // Check if workflow was assigned/updated
          const hasWorkflow = workflow && workflow.length > 0;
          const isNewFacility = isNew || shouldCreateNewDraft;
          
          if (isPublish) {
            if (hasWorkflow) {
              toast.success("Template published successfully! Emails sent to approvers.");
            } else {
              toast.success("Template published successfully!");
            }
            setTimeout(() => navigate("/plant/forms"), 1500);
          } else {
            if (isEditingPublished) {
              toast.success("New draft version created successfully! The original published form remains unchanged.");
              setTimeout(() => navigate("/plant/forms/draft", { state: { shouldRefresh: true } }), 1500);
            } else if (hasWorkflow && !isNewFacility) {
              toast.success("Template draft saved successfully! Emails sent to approvers for workflow assignment.");
            } else {
              toast.success("Template draft saved successfully!");
            }
          }
        }
      }
    } catch (err) {
      logError("Save form", err);
      if (!silent) {
        // Check if it's a plan limit error
        if (err.response?.data?.overLimit) {
          toast.error("Your form limit is reached. Contact admin");
          // Redirect to plans page after showing error
          setTimeout(() => {
            navigate("/company/plans");
          }, 2000);
        } else {
          const errorMessage = err.response?.data?.message || err.message || "Error saving form";
          toast.error(errorMessage);
        }
      }
      setSaveStatus("Error");
    } finally {
      saveInProgress.current = false;
      if (!silent) setLoading(false);
    }
  }, [FacilityName, description, workflow, sections, user?.plantId, formId, activeView, searchParams, navigate, setActiveView, status]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.data.current?.type === "palette-item") {
      const fieldType = active.id;
      
      setSections(prev => {
        let targetSectionId = prev[0].id;

        if (over.data.current?.type === "section") {
          targetSectionId = over.id;
        } else if (over.data.current?.sectionId) {
          targetSectionId = over.data.current.sectionId;
        } else if (over.id.toString().startsWith("section-")) {
          targetSectionId = over.id;
        }
        
        const timestamp = Date.now();
        const config = INITIAL_FIELD_CONFIG[fieldType];
        const newField = {
          id: `field-${timestamp}`,
          fieldId: `${fieldType}_${timestamp}`,
          type: fieldType,
          ...config,
          width: "100%",
          settings: {
            required: false,
            readOnly: false,
            visibility: "always",
            roleAccess: ["Employee", "Approver", "Admin"]
          }
        };

        setSelectedField(newField);
        setIsDirty(true);
        
        return prev.map(section => {
          if (section.id === targetSectionId) {
            return { ...section, fields: [...section.fields, newField] };
          }
          return section;
        });
      });
    } else {
      const activeSectionId = active.data.current?.sectionId;
      const overSectionId = over.data.current?.sectionId || over.id;

      if (activeSectionId === overSectionId) {
        setSections(prev => prev.map(section => {
          if (section.id === activeSectionId) {
            // Regular field reordering within section
            const oldIndex = (section.fields || []).findIndex(f => f.id === active.id);
            const newIndex = (section.fields || []).findIndex(f => f.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
              setIsDirty(true);
              return { ...section, fields: arrayMove(section.fields, oldIndex, newIndex) };
            }
          }
          return section;
        }));
      }
    }
  }, []);

  const updateFieldSettings = useCallback((fieldId, newSettings) => {
    setSections(prev => prev.map(section => ({
      ...section,
      fields: (section.fields || []).map(field => 
        field.id === fieldId ? { ...field, ...newSettings } : field
      )
    })));

    setSelectedField(prev => {
      if (prev?.id === fieldId) {
        return { ...prev, ...newSettings };
      }
      return prev;
    });
    setIsDirty(true);
  }, []);

  const deleteField = useCallback((fieldId) => {
    setSections(prev => prev.map(section => ({
      ...section,
      fields: (section.fields || []).filter(field => field.id !== fieldId)
    })));
    setSelectedField(prev => prev?.id === fieldId ? null : prev);
    setIsDirty(true);
  }, []);

  if (fetching) return <InitializingOverlay />;


  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50 overflow-hidden font-sans">
      <FacilityBuilderHeader 
        formName={formName}
        setFacilityName={setFacilityName}
        status={status}
        saveStatus={saveStatus}
        activeView={activeView}
        setActiveView={setActiveView}
        handleSave={handleSave}
        loading={loading}
        navigate={navigate}
      />

      <main className="flex-1 flex overflow-hidden bg-[#FBFBFE]">
        {activeView === "designer" ? (
          <DesignerView 
            sensors={sensors}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            sections={sections}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
            setSections={setSections}
            updateFieldSettings={updateFieldSettings}
            deleteField={deleteField}
            activeId={activeId}
          />
        ) : activeView === "workflow" ? (
          <WorkflowView workflow={workflow} setWorkflow={setWorkflow} />
        ) : (
          <PreviewView sections={sections} setSections={setSections} />
        )}
      </main>
    </div>
  );
}
