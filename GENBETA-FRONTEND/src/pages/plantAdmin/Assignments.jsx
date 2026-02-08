import { useState, useEffect } from "react";
import { ClipboardList, Search, Filter, Trash2, Calendar, User, FileText, CheckCircle2, Clock } from "lucide-react";
import { assignmentApi } from "../../api/assignment.api";

function AssignmentRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-50 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
      <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded-full" /></td>
      <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-100 rounded-lg ml-auto" /></td>
    </tr>
  );
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentApi.getPlantAssignments();
      if (response.success) setAssignments(response.data);
    } catch (error) { console.error("Failed to fetch assignments:", error); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return;
    try {
      const response = await assignmentApi.deleteAssignment(id);
      if (response.success) setAssignments(prev => prev.filter(a => a._id !== id));
    } catch (error) { console.error("Delete failed:", error); }
  };

  const filteredAssignments = assignments.filter(a => {
    const templateName = a.templateId?.templateName || a.templateId?.formName || "";
    const matchesSearch = templateName.toLowerCase().includes(searchTerm.toLowerCase()) || a.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

    const getStatusBadge = (status) => {
      switch (status) {
        case "PENDING": return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5"><Clock className="w-3 h-3" /> Pending</span>;
        case "FILLED": return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Filled</span>;
        case "SUBMITTED": return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Submitted</span>;
        default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full uppercase">{status}</span>;
      }
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-gray-900">Form Assignments</h1><p className="text-sm text-gray-500">Track and manage templates assigned to employees.</p></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input type="text" placeholder="Search assignments..." className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 py-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
          <select className="bg-white border-gray-100 rounded-xl shadow-sm px-4 py-2 text-gray-600 font-medium outline-none focus:ring-2 focus:ring-indigo-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="FILLED">Filled</option>
            <option value="SUBMITTED">Submitted</option>
          </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Template & Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned At</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => <AssignmentRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Template & Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned At</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><FileText className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{assignment.templateId?.templateName || assignment.templateId?.formName || "Unknown Template"}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5"><User className="w-3 h-3" /><span>{assignment.employeeId?.name || "Unknown Employee"}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4 text-gray-400" />{new Date(assignment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4" />{new Date(assignment.createdAt).toLocaleDateString()}</div></td>
                  <td className="px-6 py-4">{getStatusBadge(assignment.status)}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(assignment._id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all" title="Remove Assignment"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6"><ClipboardList className="w-10 h-10 text-gray-300" /></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search or filters, or assign a template to an employee from the Form Templates page.</p>
        </div>
      )}
    </div>
  );
}
