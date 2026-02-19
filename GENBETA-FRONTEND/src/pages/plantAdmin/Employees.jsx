import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userApi } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import { UserPlus } from "lucide-react";
import { 
  EmployeeSearch,
  EmployeeTable,
  EmployeeActions,
  EmployeeExport
} from "../../components/employees";

// Import React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Employees() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editModal, setEditModal] = useState({ open: false, employee: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
  const [editFacility, setEditFacility] = useState({ name: "", email: "", position: "", phoneNumber: "" });

  // Fetch employees using React Query
  const {
    data: allEmployees = [],
    isLoading: loading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['employees', user?.plantId],
    queryFn: async () => {
      if (!user?.plantId) return [];
      const response = await userApi.getPlantEmployees(user.plantId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to load employees");
      }
    },
    enabled: !!user?.plantId,
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return allEmployees;
    
    const term = searchTerm.toLowerCase();
    return allEmployees.filter(emp => 
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      (emp.position && emp.position.toLowerCase().includes(term))
    );
  }, [allEmployees, searchTerm]);

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ employeeId, updateData }) => {
      const response = await userApi.updateUser(employeeId, updateData);
      if (!response.success) {
        throw new Error(response.message || "Failed to update employee");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', user?.plantId] });
      toast.success("Employee updated successfully");
      setEditModal({ open: false, employee: null });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update employee");
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId) => {
      const response = await userApi.deleteUser(employeeId);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete employee");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', user?.plantId] });
      toast.success("Employee deleted successfully");
      setDeleteModal({ open: false, employee: null });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });

  const openEditModal = (emp) => {
    setEditFacility({
      name: emp.name || "",
      email: emp.email || "",
      position: emp.position || "",
      phoneNumber: emp.phoneNumber || ""
    });
    setEditModal({ open: true, employee: emp });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateEmployeeMutation.mutate({
      employeeId: editModal.employee._id,
      updateData: editFacility
    });
  };

  const handleDelete = () => {
    deleteEmployeeMutation.mutate(deleteModal.employee._id);
  };

  // Show loading state while fetching
  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Error loading employees: {error.message}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-500">Manage your plant's team and assign roles.</p>
        </div>
        <div className="flex items-center gap-2">
          <EmployeeExport allEmployees={allEmployees} searchTerm={searchTerm} />
          <button 
            onClick={() => navigate("/plant/employees/add")} 
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <EmployeeSearch 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />

        <EmployeeTable 
          employees={filteredEmployees}
          loading={loading || updateEmployeeMutation.isPending || deleteEmployeeMutation.isPending}
          onEditClick={openEditModal}
          onDeleteClick={(emp) => setDeleteModal({ open: true, employee: emp })}
          searchTerm={searchTerm}
        />
      </div>

      <EmployeeActions
        editModal={editModal}
        setEditModal={setEditModal}
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        editFacility={editFacility}
        setEditFacility={setEditFacility}
        onRefresh={refetch}
        saving={updateEmployeeMutation.isPending || deleteEmployeeMutation.isPending}
        handleEditSubmit={handleEditSubmit}
        handleDelete={handleDelete}
      />
    </div>
  );
}