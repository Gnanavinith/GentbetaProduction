import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Building2, User, Trash2, Edit, MoreVertical, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/api";

export default function PlantList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlant, setEditingPlant] = useState(null);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const res = await api.get("/api/plants");
      // Handle paginated response: if res.data has a 'data' property, use it; otherwise use res.data directly
      const plantsData = res.data.data || res.data;
      setPlants(Array.isArray(plantsData) ? plantsData : []);
    } catch (err) {
      console.error("Failed to fetch plants");
      toast.error("Failed to load plants");
    } finally {
      setLoading(false);
    }
  };

    const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this plant? This action cannot be undone.")) return;
      
      const toastId = toast.loading("Deleting plant...");
      try {
        await api.delete(`/api/plants/${id}`);
        setPlants(plants.filter(p => p._id !== id));
        toast.success("Plant deleted successfully", { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete plant", { id: toastId });
      }
    };

  const filteredPlants = plants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.adminName && p.adminName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plant Management</h1>
          <p className="text-sm text-gray-500 mt-1">Efficiently manage and monitor your company's manufacturing units.</p>
        </div>
        <Link
          to="/company/plants/create"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Add New Plant
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, code, location or admin..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 hidden md:block">
          Total: <span className="font-semibold text-gray-900">{filteredPlants.length}</span> plants
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plant Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plant Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-10 w-32 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-100 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredPlants.length > 0 ? (
                filteredPlants.map((plant) => (
                  <tr key={plant._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {plant.company?.logoUrl ? (
                          <img 
                            src={plant.company.logoUrl} 
                            alt={`${plant.company.name} logo`} 
                            className="w-10 h-10 rounded-lg object-contain bg-gray-100 p-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(plant.company.name || 'Company')}&background=0D8ABC&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-900">{plant.name}</div>
                          <div className="text-xs text-gray-500">{plant.company?.name || 'Company'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {plant.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {plant.location || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{plant.adminName || "No Admin"}</span>
                      </div>
                    </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/company/plants/${plant._id}/edit`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Plant"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(plant._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Plant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <Building2 className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">No plants found</h3>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                        We couldn't find any plants matching your search. Try a different query or add a new plant.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
