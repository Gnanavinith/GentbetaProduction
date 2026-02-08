import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userApi } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { EmployeeLimitChecker } from "./EmployeeLimitChecker";
import { validateEmployeeForm, validateEmployeeLimits } from "./EmployeeValidation";

export const AddEmployeeForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    position: ""
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Fetch usage data with React Query
  const { data: usageInfo } = useQuery({
    queryKey: ['subscription-usage'],
    queryFn: async () => {
      const response = await userApi.getSubscriptionUsage();
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData) => {
      const response = await userApi.createEmployee(employeeData);
      if (!response.success) {
        throw new Error(response.message || "Failed to create employee");
      }
      return response;
    },
    onError: (error) => {
      // Check if this is a timeout or network error but employee might have been created
      if (error.message.includes('timeout') || error.message.includes('Network Error') || error.message.includes('Network error')) {
        toast.success("Employee account created successfully (connection timeout)", { id: toast.loading("Processing...") });
        queryClient.invalidateQueries({ queryKey: ['employees', user.plantId] });
        setTimeout(() => {
          navigate("/plant/employees");
        }, 1500);
        return;
      }
      
      if (error.response?.data?.upgradeRequired) {
        setLimitReached(true);
      }
      setError(error.message || error.response?.data?.message || "Something went wrong. Please try again.");
      toast.error(error.message || error.response?.data?.message || "Something went wrong");
      setSubmitting(false);
    }
  });

  const handleLimitChange = (isLimitReached) => {
    setLimitReached(isLimitReached);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const toastId = toast.loading("Creating new employee account...");

    try {
      // Form validation
      const formValidation = validateEmployeeForm(formData);
      if (!formValidation.isValid) {
        setError(formValidation.errors[0]);
        toast.error(formValidation.errors[0], { id: toastId });
        setSubmitting(false);
        return;
      }

      // Limit validation
      if (usageInfo) {
        const limitValidation = validateEmployeeLimits(usageInfo, user.plantId);
        if (!limitValidation.isValid) {
          setError(limitValidation.message);
          toast.error(limitValidation.message, { id: toastId });
          setSubmitting(false);
          return;
        }
      }

      // Submit using mutation
      const result = await createEmployeeMutation.mutateAsync({
        ...formData,
        companyId: user.companyId,
        plantId: user.plantId
      });

      toast.success("Employee account created successfully", { id: toastId });
      // Invalidate the employees query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['employees', user.plantId] });
      setTimeout(() => {
        navigate("/plant/employees");
      }, 1000);

    } catch (err) {
      toast.error("Something went wrong. Please try again.", { id: toastId });
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/plant/employees")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-500">Create a new account for your plant staff.</p>
        </div>
      </div>

      <EmployeeLimitChecker onLimitChange={handleLimitChange} />

      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${limitReached ? 'opacity-50 pointer-events-none' : ''}`}>
        <form onSubmit={handleCreateEmployee} className="p-8 space-y-6">
          <EmployeeFormFields 
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/plant/employees")}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={submitting || limitReached}
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};