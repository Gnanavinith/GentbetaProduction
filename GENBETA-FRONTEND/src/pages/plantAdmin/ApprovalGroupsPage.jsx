import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserCheck,
  Shield
} from "lucide-react";
import { approvalGroupApi } from "../../api/approvalGroup.api";
import { userApi } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";

export default function ApprovalGroupsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (user?.role !== "PLANT_ADMIN" && user?.role !== "COMPANY_ADMIN") {
      toast.error("Access denied");
      navigate("/plant/dashboard");
      return;
    }
    fetchGroups();
    fetchEmployees();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await approvalGroupApi.getGroups();
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load approval groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      if (!user?.plantId) {
        toast.error("Plant ID not found");
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
    }
  };

  const filteredGroups = groups.filter(group =>
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this approval group?")) return;
    try {
      await approvalGroupApi.deleteGroup(id);
      toast.success("Group deleted successfully");
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  const handleEdit = (group) => {
    navigate(`/plant/approval-groups/edit/${group._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Approval Groups
            </h1>
            <p className="text-gray-600">Manage group-based approvals for rotational shifts</p>
          </div>
          <button
            onClick={() => navigate("/plant/approval-groups/create")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce((sum, group) => sum + (group.members?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.filter(g => g.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Group Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Loading groups...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No approval groups found</p>
                      <p className="text-sm text-gray-500 mt-1">Create your first group to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr key={group._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{group.groupName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{group.description || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {group.members?.length || 0} members
                          </span>
                          <div className="flex -space-x-2">
                            {(group.members || []).slice(0, 3).map((member, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-xs text-white font-bold ring-2 ring-white"
                                title={member.name}
                              >
                                {member.name?.charAt(0) || "U"}
                              </div>
                            ))}
                            {(group.members?.length || 0) > 3 && (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold ring-2 ring-white">
                                +{group.members.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {group.createdBy?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(group)}
                            className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-indigo-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(group._id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

