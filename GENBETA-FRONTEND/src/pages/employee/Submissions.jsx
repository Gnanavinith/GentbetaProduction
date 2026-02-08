import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: { color: "bg-gray-100 text-gray-800", icon: FileText },
    SUBMITTED: { color: "bg-blue-100 text-blue-800", icon: Send },
    PENDING_APPROVAL: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    APPROVED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    REJECTED: { color: "bg-red-100 text-red-800", icon: XCircle }
  };

  const config = statusConfig[status] || statusConfig.DRAFT;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace('_', ' ')}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-200 rounded w-10 h-10" />
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="h-6 bg-gray-200 rounded w-16" />
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-8" />
      </div>
    </div>
  );
}

export default function Submissions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    draft: 0,
    submitted: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [submissionsRes, statsRes] = await Promise.all([
        submissionApi.getSubmissions(),
        submissionApi.getStats()
      ]);
      
      setSubmissions(submissionsRes.success ? submissionsRes.data : []);
      setStats(statsRes.success ? statsRes.data : {});
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const formName = submission.formName?.toLowerCase() || "";
      const submitter = submission.submittedByName?.toLowerCase() || "";
      return formName.includes(searchTerm.toLowerCase()) || 
             submitter.includes(searchTerm.toLowerCase());
    });
  }, [submissions, searchTerm]);

  const handleView = (id) => {
    navigate(`/employee/submissions/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/employee/submissions/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this draft submission?")) {
      try {
        await submissionApi.deleteSubmission(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting submission:", error);
      }
    }
  };

  const handleSubmit = async (id) => {
    if (window.confirm("Are you sure you want to submit this draft?")) {
      try {
        await submissionApi.submitDraft(id);
        fetchData();
      } catch (error) {
        console.error("Error submitting draft:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
            <p className="mt-1 text-gray-600">
              Manage your form submissions and track their status
            </p>
          </div>
          <button
            onClick={() => navigate("/employee/forms")}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Submission
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-500" },
          { label: "Draft", value: stats.draft, color: "bg-gray-500" },
          { label: "Pending", value: stats.pending_approval, color: "bg-yellow-500" },
          { label: "Approved", value: stats.approved, color: "bg-green-500" },
          { label: "Rejected", value: stats.rejected, color: "bg-red-500" }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`}></div>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search submissions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating a new submission"}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => navigate("/employee/forms")}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Submission
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSubmissions.map((submission) => (
              <div key={submission._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 rounded-lg p-3">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {submission.formName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted on {format(new Date(submission.submittedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <StatusBadge status={submission.status} />
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(submission._id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {submission.status === "DRAFT" && (
                        <>
                          <button
                            onClick={() => handleEdit(submission._id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit draft"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSubmit(submission._id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Submit draft"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(submission._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}