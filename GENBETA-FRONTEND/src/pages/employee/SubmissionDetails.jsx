import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Send,
  Edit,
  Trash2
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import FacilityRenderer from "../../components/FormRenderer/FormRenderer";
import { format } from "date-fns";

// Helper function to extract all fields from form
const getFacilityFields = (form) => {
  if (!form) return [];
  
  let allFields = [...(form.fields || [])];
  
  if (form.sections) {
    form.sections.forEach(section => {
      if (section.fields) {
        allFields = [...allFields, ...section.fields];
      }
    });
  }
  
  // Filter out non-data fields and remove duplicates
  const uniqueFields = [];
  const seenIds = new Set();
  
  allFields.forEach(field => {
    const fieldId = field.fieldId || field.id;
    if (fieldId && !seenIds.has(fieldId) && 
        !["section-divider", "section-header", "spacer", "columns-2", "columns-3"].includes(field.type)) {
      seenIds.add(fieldId);
      uniqueFields.push(field);
    }
  });
  
  return uniqueFields;
};

function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: { color: "bg-gray-100 text-gray-800", icon: FileText, label: "Draft" },
    SUBMITTED: { color: "bg-blue-100 text-blue-800", icon: Send, label: "Submitted" },
    PENDING_APPROVAL: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending Approval" },
    APPROVED: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Approved" },
    REJECTED: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" }
  };

  const config = statusConfig[status] || statusConfig.DRAFT;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {config.label}
    </span>
  );
}

export default function SubmissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionApi.getSubmissionById(id);
      if (response.success) {
        setSubmission(response.data);
      } else {
        setError("Submission not found");
      }
    } catch (err) {
      setError("Failed to load submission");
      console.error("Error fetching submission:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/employee/submissions/${id}/edit`);
  };

  const handleSubmit = async () => {
    if (window.confirm("Are you sure you want to submit this draft?")) {
      try {
        await submissionApi.submitDraft(id);
        fetchSubmission(); // Refresh the data
      } catch (error) {
        console.error("Error submitting draft:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this draft submission?")) {
      try {
        await submissionApi.deleteSubmission(id);
        navigate("/employee/submissions");
      } catch (error) {
        console.error("Error deleting submission:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 h-96"></div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{error || "Submission not found"}</h3>
          <button
            onClick={() => navigate("/employee/submissions")}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/employee/submissions")}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submissions
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{submission.formName}</h1>
            <p className="mt-1 text-gray-600">Submission #{submission.numericalId}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {submission.status === "DRAFT" && (
              <>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
            )}
            <StatusBadge status={submission.status} />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="font-medium text-gray-900">
                {format(new Date(submission.submittedAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Submitted By</p>
              <p className="font-medium text-gray-900">{submission.submittedByName}</p>
              <p className="text-sm text-gray-500">{submission.submittedByEmail}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <StatusBadge status={submission.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Facility Data */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Facility Data</h2>
        </div>
        <div className="p-6">
          {submission.data ? (
            <div className="space-y-4">
              {getFacilityFields(submission.formId).map((field) => {
                const fieldValue = submission.data[field.fieldId] || submission.data[field.id];
                if (fieldValue === undefined || fieldValue === null) return null;
                
                return (
                  <div key={field.fieldId || field.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {field.label || field.question || (field.fieldId || field.id).replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    {typeof fieldValue === 'string' && fieldValue.startsWith('http') ? (
                      <a 
                        href={fieldValue} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline"
                      >
                        {fieldValue}
                      </a>
                    ) : (
                      <p className="text-gray-700">{String(fieldValue)}</p>
                    )}
                  </div>
                );
              }).filter(Boolean)}
            </div>
          ) : (
            <p className="text-gray-500 italic">No form data available</p>
          )}
        </div>
      </div>

      {/* Files Section */}
      {submission.files && submission.files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Attached Files</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {submission.files.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{file.originalName}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <a
                      href={file.url.includes('cloudinary.com') && file.mimetype && file.mimetype.startsWith('application/pdf') 
                        ? file.url.replace('/upload/', '/upload/f_auto/')
                        : file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approval History */}
      {submission.approvalHistory && submission.approvalHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Approval History</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {submission.approvalHistory.map((history, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    history.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {history.status === 'APPROVED' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        Level {history.level} - {history.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(history.actionedAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    {history.comments && (
                      <p className="mt-1 text-sm text-gray-600">{history.comments}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}