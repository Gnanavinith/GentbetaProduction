import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submissionApi } from "../../api/submission.api";
import { Eye, Calendar, FileText, CheckCircle, XCircle, Clock, Building2, Download } from "lucide-react";
import { formatDate } from "../../utils/formatDate";
import { exportToExcel, formatSubmissionsForExport } from "../../utils/excelExport";

export default function SuperAdminSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionApi.getSubmissions();
      if (response.success) {
        setSubmissions(response.data || []);
      } else {
        setError(response.message || "Failed to load submissions");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error loading submissions");
      console.error("Load submissions error:", err);
      } finally {
        setLoading(false);
      }
    };

  const handleExport = () => {
    const dataToExport = formatSubmissionsForExport(submissions);
    exportToExcel(dataToExport, "All_Submissions", "Submissions");
  };

    const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                All Submissions
              </h1>
              <p className="text-gray-600">View all form submissions across companies and plants</p>
            </div>

            <button
              onClick={handleExport}
              disabled={loading || submissions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Download className="w-5 h-5 text-indigo-600" />
              Export Data
            </button>
          </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-down">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
              <p className="text-gray-600 font-medium">Loading submissions...</p>
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No submissions found</h3>
            <p className="text-gray-500">Submissions will appear here once clients submit forms</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Facility Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Company/Plant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Submitted By</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((submission, index) => (
                    <tr
                      key={submission._id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800">{submission.formName || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{submission.companyName || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{submission.submittedBy?.name || "Anonymous"}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(submission.submittedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(submission.status)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/super/submissions/${submission._id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




