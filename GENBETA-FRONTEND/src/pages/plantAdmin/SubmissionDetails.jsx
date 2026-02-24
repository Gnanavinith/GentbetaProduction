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
  Send
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import FormRenderer from "../../components/FormRenderer/FormRenderer";
import { format } from "date-fns";

// Helper function to extract all fields from form
const getFormFields = (form) => {
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
            onClick={() => navigate("/plant/submissions")}
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
          onClick={() => navigate("/plant/submissions")}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submissions
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{submission.formName}</h1>
            <p className="mt-1 text-gray-600">
              {submission.readableId 
                ? `Submission: ${submission.readableId}` 
                : `Submission #${submission.numericalId || submission._id}`
              }
            </p>
          </div>
          
          <StatusBadge status={submission.status} />
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

      {/* Form Data */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Form Data</h2>
        </div>
        <div className="p-6">
          {submission.data ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submission.formId && Array.isArray(getFormFields(submission.formId)) && getFormFields(submission.formId).length > 0 ? (
                    getFormFields(submission.formId).map((field) => {
                      const fieldValue = submission.data[field.fieldId] || submission.data[field.id];
                      if (fieldValue === undefined || fieldValue === null || fieldValue === '') return null;
                            
                      // Try parsing JSON strings (file/image uploads)
                      let parsedValue = fieldValue;
                      if (typeof fieldValue === "string") {
                        try {
                          parsedValue = JSON.parse(fieldValue);
                        } catch {
                          // not JSON → continue with original value
                        }
                      }
                            
                      const renderFieldValue = (value) => {
                        if (value === null || value === undefined || value === "") return null;
      
                        // 🟢 FILE OBJECT (Cloudinary upload)
                        if (typeof value === "object" && value.url) {
                          return (
                            <div>
                              <a
                                href={value.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 underline"
                              >
                                {value.filename || "View File"}
                              </a>
      
                              {value.size && (
                                <span className="text-gray-500 ml-2">
                                  ({(value.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              )}
      
                              {/* Image preview */}
                              {value.mimetype?.startsWith("image") && (
                                <img
                                  src={value.url}
                                  className="mt-2 w-32 rounded border"
                                  alt=""
                                />
                              )}
                            </div>
                          );
                        }
      
                        // 🟢 JSON STRING FILE
                        if (typeof value === "string") {
                          try {
                            const parsed = JSON.parse(value);
      
                            if (parsed?.url) {
                              return renderFieldValue(field, parsed);
                            }
                          } catch {}
                        }
      
                        // 🟢 Array (checkbox / checklist)
                        if (Array.isArray(value)) {
                          return (
                            <ul className="list-disc list-inside">
                              {value.map((v, i) => (
                                <li key={i}>{String(v)}</li>
                              ))}
                            </ul>
                          );
                        }
      
                        // 🟢 Direct URL (signature)
                        if (typeof value === "string" && value.startsWith("http")) {
                          return (
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 underline"
                            >
                              View File
                            </a>
                          );
                        }
      
                        // 🟢 Boolean
                        if (typeof value === "boolean") {
                          return <span>{value ? "Yes" : "No"}</span>;
                        }
      
                        // 🟢 User Information
                        if (field.label === "User Information" && typeof value === "object") {
                          return (
                            <div className="space-y-1">
                              {Object.entries(value).map(([k, v]) => (
                                <p key={k}>
                                  <strong>{k}:</strong> {String(v)}
                                </p>
                              ))}
                            </div>
                          );
                        }
      
                        // 🟢 Generic object
                        if (typeof value === "object") {
                          // Check if this is a row-like object with col keys
                          const keys = Object.keys(value);
                          if (keys.some(key => key.startsWith('col'))) {
                            // Display as a nested table
                            return (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      {keys.map((colKey, idx) => (
                                        <th 
                                          key={idx}
                                          className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          {colKey}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                      {keys.map((colKey, idx) => (
                                        <td key={idx} className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                          {String(value[colKey])}
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            );
                          } else {
                            // Regular object display
                            return (
                              <pre className="text-sm">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            );
                          }
                        }
      
                        return <span>{String(value)}</span>;
                      };
                            
                      return (
                        <tr key={field.fieldId || field.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {field.label || field.question || (field.fieldId || field.id).replace(/([A-Z])/g, ' $1').trim() || 'Field Label'}
                          </td>
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 max-w-md">
                            {renderFieldValue(parsedValue)}
                          </td>
                        </tr>
                      );
                    }).filter(Boolean)
                  ) : (
                    Object.entries(submission.data).map(([key, value], index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {key.includes('image') || key.includes('photo') || key.includes('avatar') || key.includes('upload') ? 'Image Upload' : key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 max-w-md">
                          {(() => {
                            // Try parsing JSON strings (file/image uploads)
                            let parsedValue = value;
                            if (typeof value === "string") {
                              try {
                                parsedValue = JSON.parse(value);
                              } catch {
                                // not JSON → continue with original value
                              }
                            }
                                  
                            const renderFieldValue = (val) => {
                              if (val === null || val === undefined || val === "") return null;
      
                              // 🟢 FILE OBJECT (Cloudinary upload)
                              if (typeof val === "object" && val.url) {
                                return (
                                  <div>
                                    <a
                                      href={val.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 underline"
                                    >
                                      {val.filename || "View File"}
                                    </a>
      
                                    {val.size && (
                                      <span className="text-gray-500 ml-2">
                                        ({(val.size / 1024 / 1024).toFixed(2)} MB)
                                      </span>
                                    )}
      
                                    {/* Image preview */}
                                    {val.mimetype?.startsWith("image") && (
                                      <img
                                        src={val.url}
                                        className="mt-2 w-32 rounded border"
                                        alt=""
                                      />
                                    )}
                                  </div>
                                );
                              }
      
                              // 🟢 JSON STRING FILE
                              if (typeof val === "string") {
                                try {
                                  const parsed = JSON.parse(val);
      
                                  if (parsed?.url) {
                                    // For fallback section, call renderFieldValue with the value
                                    return renderFieldValue(parsed);
                                  }
                                } catch {}
                              }
      
                              // 🟢 Array (checkbox / checklist)
                              if (Array.isArray(val)) {
                                return (
                                  <ul className="list-disc list-inside">
                                    {val.map((v, i) => (
                                      <li key={i}>{String(v)}</li>
                                    ))}
                                  </ul>
                                );
                              }
      
                              // 🟢 Direct URL (signature)
                              if (typeof val === "string" && val.startsWith("http")) {
                                return (
                                  <a
                                    href={val}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 underline"
                                  >
                                    View File
                                  </a>
                                );
                              }
      
                              // 🟢 Boolean
                              if (typeof val === "boolean") {
                                return <span>{val ? "Yes" : "No"}</span>;
                              }
      
                              // 🟢 User Information
                              if (key.includes('User Information') && typeof val === "object") {
                                return (
                                  <div className="space-y-1">
                                    {Object.entries(val).map(([k, v]) => (
                                      <p key={k}>
                                        <strong>{k}:</strong> {String(v)}
                                      </p>
                                    ))}
                                  </div>
                                );
                              }
      
                              // 🟢 Generic object
                              if (typeof val === "object") {
                                // Check if this is a row-like object with col keys
                                const keys = Object.keys(val);
                                if (keys.some(key => key.startsWith('col'))) {
                                  // Display as a nested table
                                  return (
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            {keys.map((colKey, idx) => (
                                              <th 
                                                key={idx}
                                                className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                              >
                                                {colKey}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          <tr>
                                            {keys.map((colKey, idx) => (
                                              <td key={idx} className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                                {String(val[colKey])}
                                              </td>
                                            ))}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                } else {
                                  // Regular object display
                                  return (
                                    <pre className="text-sm">
                                      {JSON.stringify(val, null, 2)}
                                    </pre>
                                  );
                                }
                              }
      
                              return <span>{String(val)}</span>;
                            };
                                  
                            return renderFieldValue(parsedValue);
                          })()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
            <h2 className="text-lg font-medium text-gray-900">File Upload</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {submission.files.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <a
                    href={file.url.includes('cloudinary.com') && file.mimetype && file.mimetype.startsWith('application/pdf') 
                      ? file.url.replace('/upload/', '/upload/f_auto/')
                      : file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 underline break-all"
                  >
                    {file.url}
                  </a>
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