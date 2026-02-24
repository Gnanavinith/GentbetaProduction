import api from "./api";

export const assignmentApi = {
  getMyAssignments: async () => {
    try {
      const response = await api.get("/api/assignments/my");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getPlantAssignments: async () => {
    try {
      const response = await api.get("/api/assignments/plant");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  assignTemplate: async (assignmentData) => {
    try {
      console.log("Sending assignment data to backend:", assignmentData);
      const response = await api.post("/api/assignments/assign", assignmentData);
      console.log("Received response from backend:", response.data);
      return response.data;
    } catch (error) {
      console.error("Assignment API error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      console.error("Error message:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  getAssignmentById: async (id) => {
    try {
      const response = await api.get(`/api/assignments/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  deleteAssignment: async (id) => {
    try {
      const response = await api.delete(`/api/assignments/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  submitAssignment: async (id, data, files = []) => {
    try {
      // First, get the assignment details to get the template ID
      const assignmentResponse = await api.get(`/api/assignments/${id}`);
      if (!assignmentResponse.data.success) {
        return {
          success: false,
          message: assignmentResponse.data.message || "Failed to fetch assignment details"
        };
      }

      const assignment = assignmentResponse.data.data;
      const templateId = assignment.templateId?._id || assignment.templateId;

      if (!templateId) {
        return {
          success: false,
          message: "Template ID not found in assignment"
        };
      }

      // Use the direct submission approach with the template ID
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      files.forEach((file) => {
        formData.append(file.fieldId, file.file);
      });

      const response = await api.post(`/api/form-task/submit-direct/${templateId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // If submission was successful, update the assignment status
      if (response.data.success) {
        try {
          await api.patch(`/api/assignments/${id}`, { status: "SUBMITTED" });
        } catch (updateError) {
          console.warn("Failed to update assignment status:", updateError);
          // Don't fail the submission if assignment update fails
        }
      }
      
      return response.data;
    } catch (error) {
      const errorResponse = error.response?.data;
      if (errorResponse?.overLimit) {
        return {
          success: false,
          message: errorResponse.message || "Plan limit exceeded. Please upgrade your subscription.",
          overLimit: true,
          overLimitDetails: errorResponse.overLimitDetails
        };
      }
      return {
        success: false,
        message: errorResponse?.message || error.message,
      };
    }
  },

  submitDirect: async (templateId, data, files = []) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      files.forEach((file) => {
        formData.append(file.fieldId, file.file);
      });

      const response = await api.post(`/api/form-task/submit-direct/${templateId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      const errorResponse = error.response?.data;
      if (errorResponse?.overLimit) {
        return {
          success: false,
          message: errorResponse.message || "Plan limit exceeded. Please upgrade your subscription.",
          overLimit: true,
          overLimitDetails: errorResponse.overLimitDetails
        };
      }
      return {
        success: false,
        message: errorResponse?.message || error.message,
      };
    }
  },

  // Legacy/Compatibility methods
  getTaskStats: async () => {
    try {
      const response = await api.get("/api/assignments/my");
      if (response.data.success) {
        const assignments = response.data.data;
        return {
          success: true,
          data: {
            pendingCount: assignments.filter(a => a.status === 'PENDING').length,
            completedCount: assignments.filter(a => a.status === 'SUBMITTED').length
          }
        };
      }
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAssignedTasks: async () => {
    return assignmentApi.getMyAssignments();
  },

  getTaskById: async (id) => {
    return assignmentApi.getAssignmentById(id);
  },

  submitTask: async (id, data, files = []) => {
    return assignmentApi.submitAssignment(id, data, files);
  },

  createTasks: async (data) => {
    // Validate input data
    if (!data.formIds || !Array.isArray(data.formIds) || data.formIds.length === 0) {
      return { success: false, message: "No forms selected for assignment" };
    }
    
    if (!data.assignedTo) {
      return { success: false, message: "No employee selected for assignment" };
    }
    
    console.log("Assignment API called with:", {
      templateIds: data.formIds,
      employeeIds: [data.assignedTo],
      dueDate: data.dueDate
    });
    
    return assignmentApi.assignTemplate({
      templateIds: data.formIds, // Sending array of IDs
      employeeIds: [data.assignedTo],
      dueDate: data.dueDate
    });
  }
};
