import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { approvalApi } from "../../api/approval.api";
import { submissionApi } from "../../api/submission.api";
import FormRenderer from "../../components/FormRenderer/FormRenderer.jsx";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  User2,
  CalendarDays,
  FileCheck,
  AlertCircle,
  ChevronRight,
  Send
} from "lucide-react";
import Loader from "../../components/common/Loader.jsx";

export default function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({});
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const assigned = await approvalApi.getAssignedSubmissions();
      const res = await submissionApi.getSubmissionById(id);

      if (res.success) {
        const assignedItem = assigned.data?.find(a => a._id === id);
        // Fix: Always use formId since that's what the backend returns
        const template = res.data.formId;
        const flow = template?.approvalFlow || [];
        const currentLevel = res.data.currentLevel || 1;
        
        let isMyTurn = assignedItem?.isMyTurn || false;
        
        if (!isMyTurn && user?.userId) {
          if (flow.length === 0) {
            if (res.data.status === "PENDING_APPROVAL" || res.data.status === "SUBMITTED") {
              isMyTurn = true;
            }
          } else {
            const currentLevelApprover = flow.find(f => f.level === currentLevel);
            if (currentLevelApprover) {
              const approverId = currentLevelApprover.approverId?._id || currentLevelApprover.approverId;
              if (approverId === user.userId) {
                isMyTurn = true;
              }
            }
          }
        }
        
        let pendingApproverName = assignedItem?.pendingApproverName;
        if (!pendingApproverName && !isMyTurn && flow.length > 0) {
          const currentLevelApprover = flow.find(f => f.level === currentLevel);
          pendingApproverName = currentLevelApprover?.approverId?.name || "Current Approver";
        }
        
        setSubmission({
          ...res.data,
          isMyTurn,
          pendingApproverName
        });
        // Handle form data with fallbacks for different possible structures
        const responseData = res.data.data;
        let formData = {};
        
        if (responseData && typeof responseData === 'object') {
          // Try different possible structures for form data
          if (responseData.responses) {
            formData = { ...responseData.responses };
          } else if (responseData.data) {
            formData = { ...responseData.data };
          } else {
            formData = { ...responseData };
          }
        }
        
        // Also merge any files data that might contain signatures
        if (res.data.files && Array.isArray(res.data.files)) {
          res.data.files.forEach(file => {
            if (file.fieldId && file.url) {
              formData[file.fieldId] = file.url; // Map file URLs to field IDs
            }
          });
        }
        
        setFormData(formData);
        
        // Debug: Log the data structure
        console.log('Submission data:', res.data);
        console.log('Form data:', formData);
        console.log('Form data keys:', Object.keys(formData || {}));
        console.log('Files in submission:', res.data.files);
        console.log('Template:', template);
        console.log('Template fields:', template?.fields);
        console.log('Template sections:', template?.sections);
        
        // Log signature-related data if present
        if (formData) {
          console.log('All form data entries:', formData);
          Object.keys(formData).forEach(key => {
            const value = formData[key];
            console.log(`Field: ${key}, Type: ${typeof value}, Value:`, value);
            if (typeof value === 'string' && (value.includes('cloudinary') || value.includes('signature') || value.includes('.png') || value.includes('data:image'))) {
              console.log(`Signature field found - Key: ${key}, Value: ${value}`);
            }
          });
        }
        
        // Also log template fields to see what signature fields exist
        if (template) {
          const signatureFields = [];
          if (template.fields) {
            signatureFields.push(...template.fields.filter(f => f.type === 'signature'));
          }
          if (template.sections) {
            template.sections.forEach(section => {
              if (section.fields) {
                signatureFields.push(...section.fields.filter(f => f.type === 'signature'));
              }
            });
          }
          console.log('Signature fields in template:', signatureFields);
        }
      } else {
        // Set submission to null if API call was unsuccessful
        setSubmission(null);
      }
    } catch (error) {
      console.error("Error fetching approval data:", error);
      // Set submission to null if there's an error
      setSubmission(null);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setProcessing(true);
    const res = await approvalApi.processApproval({
      submissionId: id,
      status: "approved",
      comments,
      data: formData
    });

    if (res.success) {
      toast.success("Approved successfully");
      navigate("/employee/dashboard");
    } else {
      toast.error(res.message || "Failed to approve");
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setProcessing(true);
    const res = await approvalApi.processApproval({
      submissionId: id,
      status: "rejected",
      comments,
      data: formData
    });

    if (res.success) {
      toast.success("Rejected successfully");
      setShowRejectModal(false);
      navigate("/employee/dashboard");
    } else {
      toast.error(res.message || "Failed to reject");
    }
    setProcessing(false);
  };

  if (loading) return <Loader />;

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-600 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
          <p className="text-gray-600 mb-6">The submission you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate("/employee/dashboard")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const template = submission.formId;
  const { approvalHistory, isMyTurn, pendingApproverName } = submission;
  const submitterName = submission.submittedBy?.name || "Employee";

  const statusConfig = {
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, label: "Approved" },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, label: "Rejected" },
    PENDING_APPROVAL: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock, label: "Pending" },
    SUBMITTED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Send, label: "Submitted" }
  };

  const currentStatus = statusConfig[submission.status] || statusConfig.SUBMITTED;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate("/employee/dashboard")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Pending</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 px-6 py-8 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {template?.formName || template?.templateName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-indigo-100 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <User2 size={14} />
                    {submitterName}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {new Date(submission.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} border`}>
                <StatusIcon size={14} />
                {currentStatus.label}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {!isMyTurn && submission.status === "PENDING_APPROVAL" && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-amber-800 font-medium">Awaiting Approval</p>
                  <p className="text-amber-600 text-sm">
                    Currently with <span className="font-semibold">{pendingApproverName}</span>
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileCheck size={18} className="text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-800">Form Details</h2>
              </div>
              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-5">
                <FormRenderer
                  form={template}
                  initialData={formData}
                  onDataChange={setFormData}
                  readOnly
                  key={`form-renderer-${id}-${JSON.stringify(formData).length}`}
                />
              </div>
            </div>

            {approvalHistory && approvalHistory.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-slate-400" />
                  <h2 className="text-lg font-semibold text-slate-800">Approval Timeline</h2>
                </div>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
                  <div className="space-y-4">
                    {approvalHistory.map((item, idx) => {
                      const isApproved = item.status === "APPROVED";
                      return (
                        <div key={idx} className="relative flex items-start gap-4 pl-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                            isApproved ? "bg-emerald-100" : "bg-red-100"
                          }`}>
                            {isApproved ? (
                              <CheckCircle2 className="text-emerald-600" size={16} />
                            ) : (
                              <XCircle className="text-red-600" size={16} />
                            )}
                          </div>
                          <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-semibold ${isApproved ? "text-emerald-700" : "text-red-700"}`}>
                                Level {item.level} - {isApproved ? "Approved" : "Rejected"}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(item.actionedAt).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                            {item.comments && (
                              <p className="text-sm text-slate-600 mt-2 italic">"{item.comments}"</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {isMyTurn && (
              <div className="pt-4 border-t border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Decision</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="group relative flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={20} />
                    <span>Approve</span>
                    <ChevronRight size={16} className="absolute right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                    className="group relative flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={20} />
                    <span>Reject</span>
                    <ChevronRight size={16} className="absolute right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertCircle className="text-white" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reject Submission</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Please explain why this submission is being rejected..."
                className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">
                The employee will receive this feedback via email.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setComments("");
                  }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !comments.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/25"
                >
                  {processing ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Rejecting...
                    </span>
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
