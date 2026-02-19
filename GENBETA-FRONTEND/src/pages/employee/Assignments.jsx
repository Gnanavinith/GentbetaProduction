import { useState, useEffect } from "react";
import { ClipboardList, Search, Clock, FileText, ChevronRight, Calendar, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { assignmentApi } from "../../api/assignment.api";

export default function EmployeeAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentApi.getMyAssignments();
      if (response.success) {
        setAssignments(response.data);
      } else {
        toast.error(response.message || "Failed to fetch assignments");
      }
    } catch (error) {
      toast.error("An error occurred while fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const name = a.templateId?.templateName || a.templateId?.formName || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-sm text-gray-500">Facility templates specifically assigned to you.</p>
        </div>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Search assigned forms..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-100"></div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-50"></div>
              ))}
            </div>
          </div>
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} />
                      Facility Name
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={12} />
                      Assigned Date
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={12} />
                      Date
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Status</span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((assignment) => {
                  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && assignment.status !== "FILLED";
                  
                  return (
                    <tr key={assignment._id} className="group hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-lg group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white transition-all">
                            <FileText size={16} />
                          </div>
                          <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                            {assignment.templateId?.templateName || assignment.templateId?.formName || "Untitled Template"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar size={12} className="text-slate-400" />
                          <span className="font-semibold">
                            {new Date(assignment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar size={12} />
                          <span className="font-semibold">
                            {new Date(assignment.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          {assignment.status === "FILLED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold uppercase border border-emerald-200">
                              <CheckCircle size={14} />
                              Filled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold uppercase border border-amber-200">
                              <Clock size={14} />
                              Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/employee/fill-assignment/${assignment._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm group/btn"
                        >
                          {assignment.status === "FILLED" ? "View" : "Fill Facility"}
                          <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No assigned forms</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don't have any forms specifically assigned to you at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
