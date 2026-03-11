import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Users, 
  ArrowLeft,
  Shield,
  UserPlus
} from "lucide-react";
import { approvalGroupApi } from "../../api/approvalGroup.api";
import { userApi } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";

export default function CreateApprovalGroupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "PLANT_ADMIN" && user?.role !== "COMPANY_ADMIN") {
      toast.error("Access denied");
      navigate("/plant/approval-groups");
      return;
    }
    fetchEmployees();
  }, [user, navigate]);

  const fetchEmployees = async () => {
    try {
      if (!user?.plantId) {
        toast.error("Plant ID not found");
        navigate("/plant/approval-groups");
        return;
      }
      
      const response = await userApi.getPlantEmployees(user.plantId);
      if (response.success) {
        setEmployees(response.data || []);
      } else {
        toast.error("Failed to load employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Error loading employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      return toast.error("Please enter a group name");
    }
    
    if (selectedMembers.length === 0) {
      return toast.error("Please select at least one member");
    }

    setSaving(true);
    try {
      await approvalGroupApi.createGroup({ 
        groupName, 
        description, 
        members: selectedMembers 
      });
      
      toast.success("Group created successfully");
      navigate("/plant/approval-groups");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setSaving(false);
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const selectAll = () => {
    setSelectedMembers(employees.map(e => e._id));
  };

  const deselectAll = () => {
    setSelectedMembers([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={() => navigate("/plant/approval-groups")}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Approval Groups</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Approval Group
            </h1>
            <p className="text-gray-600 mt-1">Set up a new group for rotational shift approvals</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Details Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Group Information
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Shift Engineers, Night Supervisors, Safety Team"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Choose a descriptive name that identifies the group's purpose</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description of the group's role and responsibilities..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Brief description to help identify the group's purpose</p>
              </div>
            </div>
          </div>

          {/* Member Selection Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  Select Group Members
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1 bg-indigo-50 rounded-lg transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-xs font-medium text-gray-600 hover:text-gray-800 px-3 py-1 bg-gray-100 rounded-lg transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="border border-gray-300 rounded-xl max-h-96 overflow-y-auto">
                {employees.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No employees found</p>
                    <p className="text-sm text-gray-500 mt-1">Add employees to your plant first</p>
                  </div>
                ) : (
                  employees.map((employee) => (
                    <label
                      key={employee._id}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-all border-b last:border-b-0 border-gray-200 ${
                        selectedMembers.includes(employee._id)
                          ? "bg-indigo-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(employee._id)}
                        onChange={() => toggleMember(employee._id)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md">
                          {employee.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg">
                          {employee.role?.replace("_", " ")}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-900">
                    {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                {selectedMembers.length > 0 && (
                  <p className="text-xs text-indigo-700 font-medium">
                    Any one member can approve on behalf of the group
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/plant/approval-groups")}
              className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || selectedMembers.length === 0}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Group...
                </span>
              ) : (
                "Create Approval Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
