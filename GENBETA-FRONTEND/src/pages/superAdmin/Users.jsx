import { useEffect, useState } from "react";
import { userApi } from "../../api/user.api";
import { Users as UsersIcon, Mail, Shield, Building2 } from "lucide-react";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.message || "Failed to load users");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error loading users");
      console.error("Load users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      SUPER_ADMIN: "bg-purple-100 text-purple-800",
      PLANT_ADMIN: "bg-blue-100 text-blue-800",
      COMPANY_ADMIN: "bg-green-100 text-green-800",
      CLIENT: "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[role] || roleColors.CLIENT}`}>
        {role?.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Users
          </h1>
          <p className="text-gray-600">Manage all system users</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
              <p className="text-gray-600 font-medium">Loading users...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No users found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user, index) => (
              <div
                key={user._id || index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{user.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  {user.companyName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      {user.companyName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




