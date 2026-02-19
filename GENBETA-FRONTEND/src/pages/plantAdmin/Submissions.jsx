import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: { color: "bg-gray-100 text-gray-800", icon: FileText },
    SUBMITTED: { color: "bg-blue-100 text-blue-800", icon: FileText },
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
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [stats, setStats] = useState({
    draft: 0,
    submitted: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Recalculate stats from local data as fallback
  const calculateLocalStats = useMemo(() => {
    const localStats = {
      draft: 0,
      submitted: 0,
      pending_approval: 0,
      approved: 0,
      rejected: 0,
      total: submissions.length
    };
  
    submissions.forEach(submission => {
      const status = submission.status?.toLowerCase();
      if (status === 'draft') localStats.draft++;
      else if (status === 'submitted') localStats.submitted++;
      else if (status === 'pending_approval' || status === 'pending-approval') localStats.pending_approval++;
      else if (status === 'approved') localStats.approved++;
      else if (status === 'rejected') localStats.rejected++;
    });
  
    return localStats;
  }, [submissions]);

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
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group submissions by form name
  const groupedSubmissions = useMemo(() => {
    const grouped = {};
    submissions.forEach(submission => {
      const formName = submission.formName || "Untitled Form";
      if (!grouped[formName]) {
        grouped[formName] = [];
      }
      grouped[formName].push(submission);
    });
    return grouped;
  }, [submissions]);

  // Filter submissions within each group
  const filteredGroupedSubmissions = useMemo(() => {
    const filtered = {};
    Object.entries(groupedSubmissions).forEach(([formName, subs]) => {
      const filteredSubs = subs.filter(submission => {
        const matchesSearch = submission.formName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             submission.submittedByName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === "all" || 
                             submission.status.toLowerCase().replace('_', '-') === filterStatus;
        
        return matchesSearch && matchesStatus;
      });
      
      if (filteredSubs.length > 0) {
        filtered[formName] = filteredSubs;
      }
    });
    return filtered;
  }, [groupedSubmissions, searchTerm, filterStatus]);

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleView = (id) => {
    navigate(`/plant/submissions/${id}`);
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

  const totalFilteredSubmissions = Object.values(filteredGroupedSubmissions).flat().length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
            <p className="mt-1 text-gray-600">
              Manage form submissions for your plant
            </p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total || calculateLocalStats.total, color: "bg-blue-500" },
          { label: "Draft", value: stats.draft || calculateLocalStats.draft, color: "bg-gray-500" },
          { label: "Pending", value: stats.pending_approval || calculateLocalStats.pending_approval, color: "bg-yellow-500" },
          { label: "Approved", value: stats.approved || calculateLocalStats.approved, color: "bg-green-500" },
          { label: "Rejected", value: stats.rejected || calculateLocalStats.rejected, color: "bg-red-500" }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`}></div>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            {stat.value === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {stat.label === "Total" ? "No submissions yet" : "None"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="pending-approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Folder View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {totalFilteredSubmissions === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter terms" 
                : "Submissions will appear here when employees submit forms. Encourage your team to start filling out forms!"}
            </p>
            {stats.total === 0 && calculateLocalStats.total === 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Tip:</span> Create some forms first, then share them with your employees to start collecting submissions.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(filteredGroupedSubmissions).map(([formName, submissionsInFolder]) => (
              <div key={formName}>
                {/* Folder Header */}
                <div 
                  className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => toggleFolder(formName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-600">
                        {expandedFolders[formName] ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                      </div>
                      <div className="bg-indigo-100 rounded-lg p-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {formName} 
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({submissionsInFolder.length} {submissionsInFolder.length === 1 ? 'submission' : 'submissions'})
                          </span>
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submissions in folder */}
                {expandedFolders[formName] && (
                  <div className="pl-8 divide-y divide-gray-200">
                    {submissionsInFolder.map((submission) => (
                      <div key={submission._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-indigo-100 rounded-lg p-2">
                              <FileText className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {submission.formName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                Submitted by {submission.submittedByName} on {format(new Date(submission.submittedAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <StatusBadge status={submission.status} />
                            
                            <button
                              onClick={() => handleView(submission._id)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}