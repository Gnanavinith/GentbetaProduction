import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { assignmentApi } from "../../api/assignment.api";
import { formApi } from "../../api/form.api";
import FacilityRenderer from "../../components/FacilityRenderer/FacilityRenderer";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Loader2, FileText, User, Calendar, AlertCircle } from "lucide-react";

// ==================== CONFIGURATION ====================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const AUTO_SAVE_INTERVAL = 60000; // 60 seconds
const DRAFT_KEY_PREFIX = "form_draft_";
const DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// ==================== IN-MEMORY CACHE ====================
const formCache = new Map();

export default function FillFacilityPage() {
  const { taskId, formId, assignmentId } = useParams();
  const navigate = useNavigate();
  
  // Get user from AuthContext at component level
  const { user: currentUser } = useAuth();
  
  // ==================== STATE ====================
  const [Facility, setFacility] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [FacilityData, setFacilityData] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  
  // ==================== REFS ====================
  const autoSaveTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isSubmittedRef = useRef(false);
  const formInstanceId = assignmentId || taskId || formId;
  const draftKey = `${DRAFT_KEY_PREFIX}${formInstanceId}`;

  // ==================== CACHE FUNCTIONS ====================
  const getCachedFacility = useCallback((id) => {
    const cached = formCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  const cacheFacility = useCallback((id, data) => {
    formCache.set(id, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // ==================== DRAFT RESTORATION ====================
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const { data, timestamp } = JSON.parse(savedDraft);
        if (Date.now() - timestamp < DRAFT_EXPIRY) {
          setFacilityData(data);
          setLastSaved(new Date(timestamp));
          toast.success("Draft restored", { duration: 2000 });
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch (err) {
        console.error("Error loading draft:", err);
        localStorage.removeItem(draftKey);
      }
    }
  }, [draftKey]);

  // ==================== AUTO-SAVE ====================
  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) return;
    
    autoSaveTimerRef.current = setInterval(() => {
      try {
        const draft = {
          data: formData,
          timestamp: Date.now()
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setLastSaved(new Date());
      } catch (err) {
        console.error("Error auto-saving draft:", err);
        if (err.name === "QuotaExceededError") {
          toast.error("Storage limit exceeded. Please submit the form.");
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [FacilityData, draftKey]);

  // ==================== CLEANUP ON UNMOUNT ====================
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    } else if (taskId) {
      fetchTask();
    } else if (formId) {
      fetchFacility();
    }
  }, [taskId, formId, assignmentId]);

  // Initialize formData when task data is loaded
  useEffect(() => {
    if (task?.submissionData && Object.keys(task.submissionData).length > 0) {
      // Only set if formData is currently empty to avoid overwriting draft data
      if (Object.keys(formData).length === 0) {
        setFacilityData(task.submissionData);
      }
    }
  }, [task, formData]);

  const fetchAssignment = async () => {
    setLoading(true);
    setError("");
    
    try {
      const cacheKey = `assignment_${assignmentId}`;
      const cached = getCachedFacility(cacheKey);
      
      if (cached) {
        setTask(cached.task);
        setFacility(cached.form);
        // Initialize formData from cached submission data if available
        if (cached.task?.submissionData && Object.keys(cached.task.submissionData).length > 0) {
          if (Object.keys(formData).length === 0) {
            setFacilityData(cached.task.submissionData);
          }
        }
        if (cached.task?.status === "FILLED") {
          setError("This assignment has already been filled.");
        }
        setLoading(false);
        return;
      }

      abortControllerRef.current = new AbortController();
      
      const response = await assignmentApi.getAssignmentById(
        assignmentId,
        { signal: abortControllerRef.current.signal }
      );
      
      if (response.success) {
        setTask(response.data);
        setFacility(response.data.templateId);
        
        cacheFacility(cacheKey, {
          task: response.data,
          form: response.data.templateId
        });
        
        // Initialize formData from assignment submission data if available
        if (response.data.submissionData && Object.keys(response.data.submissionData).length > 0) {
          if (Object.keys(formData).length === 0) {
            setFacilityData(response.data.submissionData);
          }
        }
        
        if (response.data.status === "FILLED") {
          setError("This assignment has already been filled.");
        }
      } else {
        setError(response.message || "Failed to load assignment");
        toast.error(response.message || "Failed to load assignment");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        const errorMsg = "An error occurred while fetching the assignment";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Fetch assignment error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTask = async () => {
    setLoading(true);
    setError("");
    
    try {
      const cacheKey = `task_${taskId}`;
      const cached = getCachedFacility(cacheKey);
      
      if (cached) {
        setTask(cached.task);
        setFacility(cached.form);
        // Initialize formData from cached submission data if available
        if (cached.task?.submissionData && Object.keys(cached.task.submissionData).length > 0) {
          if (Object.keys(formData).length === 0) {
            setFacilityData(cached.task.submissionData);
          }
        }
        setLoading(false);
        return;
      }

      abortControllerRef.current = new AbortController();
      
      const response = await assignmentApi.getTaskById(
        taskId,
        { signal: abortControllerRef.current.signal }
      );
      
      if (response.success) {
        setTask(response.data);
        setFacility(response.data.templateId);
        
        cacheFacility(cacheKey, {
          task: response.data,
          form: response.data.templateId
        });
        
        // Initialize formData from task submission data if available
        if (response.data.submissionData && Object.keys(response.data.submissionData).length > 0) {
          if (Object.keys(formData).length === 0) {
            setFacilityData(response.data.submissionData);
          }
        }
      } else {
        setError(response.message || "Failed to load form");
        toast.error(response.message || "Failed to load form");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        const errorMsg = "Failed to load form: " + (err.message || "Unknown error");
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Fetch task error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFacility = async () => {
    setLoading(true);
    setError("");
    
    try {
      const cacheKey = `form_${formId}`;
      const cached = getCachedFacility(cacheKey);
      
      if (cached) {
        setFacility(cached);
        setLoading(false);
        return;
      }

      abortControllerRef.current = new AbortController();
      
      const response = await formApi.getFacilityById(
        formId,
        { signal: abortControllerRef.current.signal }
      );
      
      if (response.success) {
        setFacility(response.data);
        cacheFacility(cacheKey, response.data);
        // Initialize empty formData for new forms
        if (Object.keys(formData).length === 0) {
          setFacilityData({});
        }
      } else {
        setError(response.message || "Failed to load template");
        toast.error(response.message || "Failed to load template");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        const errorMsg = "Failed to load template: " + (err.message || "Unknown error");
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Fetch form error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (submittedFacilityData, files = []) => {
    if (isSubmittedRef.current || submitting) {
      return;
    }

    console.log('[FillFacilityPage] handleSubmit called with:', {
      submittedFacilityData,
      files,
      formData: formData
    });

    // Get current user from component level
    const user = currentUser;
    
    // Create submission data with auto-field injection
    const submissionData = { ...submittedFacilityData };
    
    // Inject auto-user fields if they exist in the form
    if (form?.fields) {
      form.fields.forEach(field => {
        if (field.type === "auto-user" && !submissionData[field.fieldId]) {
          console.log('[FillFacilityPage] Injecting auto-user data for field:', field.fieldId);
          submissionData[field.fieldId] = {
            id: user?._id || "",
            name: user?.name || "",
            email: user?.email || "",
            role: user?.role || "",
            employeeID: user?.employeeID || user?._id || "",
            department: user?.department || "",
            phoneNumber: user?.phoneNumber || "",
            position: user?.position || ""
          };
        }
      });
    }

    console.log('[FillFacilityPage] Final submission data with auto-fields:', submissionData);

    isSubmittedRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      let response;
      
      if (assignmentId) {
        response = await assignmentApi.submitAssignment(
          assignmentId, 
          submissionData, 
          files
        );
      } else if (taskId) {
        response = await assignmentApi.submitTask(
          taskId, 
          submissionData, 
          files
        );
      } else {
        response = await assignmentApi.submitDirect(
          formId, 
          submissionData, 
          files
        );
      }

      if (response.success) {
        localStorage.removeItem(draftKey);
        
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
        
        toast.success("Facility submitted successfully!");
        
        navigate("/employee", { 
          state: { 
            shouldRefresh: true,
            message: "Facility submitted successfully"
          },
          replace: true
        });
      } else {
        const msg = response.message || "Failed to submit form";
        setError(msg);
        toast.error(msg);
        isSubmittedRef.current = false;
      }
    } catch (err) {
      const errorMsg = err.message || "An error occurred while submitting the form";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Submit error:", err);
      isSubmittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== FORM DATA CHANGE HANDLER ====================
  const handleFacilityDataChange = useCallback((newData) => {
    // console.log('[FillFacilityPage] handleFacilityDataChange called with:', newData);
    setFacilityData(prev => {
      // Only update if data actually changed
      if (JSON.stringify(prev) !== JSON.stringify(newData)) {
        return newData;
      }
      return prev;
    });
  }, []);

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-gray-500 text-sm">Loading form...</p>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error && !form) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => navigate("/employee")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors group"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Facility</h3>
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/employee")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors group"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        
        {lastSaved && (
          <div className="text-xs text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Facility Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Facility Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {form?.templateName || form?.formName || "Facility"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>
                    {taskId 
                      ? `Assigned by: ${task?.assignedBy?.name || "Admin"}` 
                      : "Facility"}
                  </span>
                </div>
                {(taskId || assignmentId) && task?.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Facility Content */}
        <div className="p-6">
          {form ? (
            <FacilityRenderer
              form={form}
              initialData={formData}
              onSubmit={handleSubmit}
              onDataChange={handleFacilityDataChange}
              submitting={submitting}
              disabled={task?.status === "FILLED"}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No form data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Warning */}
      {task?.status === "FILLED" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium">
            This form has already been submitted and cannot be edited.
          </p>
        </div>
      )}
    </div>
  );
}