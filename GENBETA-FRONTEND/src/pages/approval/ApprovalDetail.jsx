import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { approvalApi } from "../../api/approval.api";
import { submissionApi } from "../../api/submission.api";
import FormRenderer from "../../components/FormRenderer/FormRenderer.jsx";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, User, Calendar,
  AlertCircle, FileCheck, ChevronRight, Send, Users
} from "lucide-react";
import Loader from "../../components/common/Loader.jsx";

// ── GroupApprovalPanel ────────────────────────────────────────────────────────
// Shows all group members with approved/pending status for a given flow level

function GroupApprovalPanel({ levelConfig, approvalHistory, currentLevel, submissionStatus }) {
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);

  const groupId =
    typeof levelConfig.groupId === "object"
      ? levelConfig.groupId._id?.toString()
      : levelConfig.groupId?.toString();

  const groupName =
    levelConfig.groupName ||
    levelConfig.name ||
    (typeof levelConfig.groupId === "object" ? levelConfig.groupId?.groupName : null) ||
    "Approval Group";

  useEffect(() => {
    if (!groupId) { setLoading(false); return; }
    (async () => {
      try {
        const { approvalGroupApi } = await import("../../api/approvalGroup.api");
        const res = await approvalGroupApi.getGroupById(groupId);
        if (res?.success) setGroupData(res.data);
      } catch (e) {
        console.error("Failed to load group members:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId]);

  // Find who acted at this level
  const historyEntry = approvalHistory?.find(
    h => h.level === levelConfig.level && h.isGroupApproval
  );
  const approvedById = historyEntry?.approverId?.toString();
  const actionStatus = historyEntry?.status;

  const isLevelCompleted = levelConfig.level < currentLevel ||
    submissionStatus === "APPROVED" || submissionStatus === "REJECTED";
  const isLevelCurrent = levelConfig.level === currentLevel &&
    submissionStatus !== "APPROVED" && submissionStatus !== "REJECTED";

  return (
    <div className={`rounded-xl border p-4 ${
      actionStatus === "REJECTED" ? "bg-red-50 border-red-200" :
      isLevelCompleted ? "bg-green-50 border-green-200" :
      isLevelCurrent ? "bg-amber-50 border-amber-200" :
      "bg-gray-50 border-gray-200"
    }`}>
      {/* Level header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          actionStatus === "REJECTED" ? "bg-red-500 text-white" :
          isLevelCompleted ? "bg-green-500 text-white" :
          isLevelCurrent ? "bg-amber-500 text-white" :
          "bg-gray-300 text-gray-600"
        }`}>
          {levelConfig.level}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{groupName}</span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
              <Users className="w-3 h-3" /> Group
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Any one member can approve</p>
        </div>
        {actionStatus === "REJECTED" && <XCircle className="w-5 h-5 text-red-500" />}
        {isLevelCompleted && actionStatus !== "REJECTED" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        {isLevelCurrent && <Clock className="w-5 h-5 text-amber-500" />}
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex items-center gap-2 py-2 px-3 bg-white rounded-lg border border-gray-100">
          <div className="animate-spin w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
          <span className="text-xs text-gray-500">Loading members…</span>
        </div>
      ) : groupData?.members?.length > 0 ? (
        <div className="space-y-1.5">
          {groupData.members.map((m) => {
            const memberId = (typeof m === "object" ? m._id : m)?.toString();
            const memberName = typeof m === "object" ? m.name : "Member";
            const memberEmail = typeof m === "object" ? m.email : null;
            const didAct = approvedById && memberId === approvedById;
            const memberRejected = didAct && actionStatus === "REJECTED";
            const memberApproved = didAct && actionStatus === "APPROVED";

            return (
              <div
                key={memberId}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm border ${
                  memberRejected ? "bg-red-50 border-red-200" :
                  memberApproved ? "bg-green-50 border-green-200" :
                  "bg-white border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    memberRejected ? "bg-red-200 text-red-700" :
                    memberApproved ? "bg-green-200 text-green-700" :
                    "bg-indigo-100 text-indigo-600"
                  }`}>
                    {memberName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className={`font-medium leading-tight ${
                      memberRejected ? "text-red-700" :
                      memberApproved ? "text-green-700" :
                      "text-gray-700"
                    }`}>
                      {memberName}
                    </p>
                    {memberEmail && (
                      <p className="text-xs text-gray-400">{memberEmail}</p>
                    )}
                  </div>
                </div>

                {memberRejected && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    <XCircle className="w-3.5 h-3.5" /> Rejected
                  </span>
                )}
                {memberApproved && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                  </span>
                )}
                {!didAct && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {isLevelCurrent ? "Pending" : isLevelCompleted ? "Not required" : "Waiting"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-3 py-2 bg-white rounded-lg border border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-1">{groupName}</p>
          <p className="text-xs text-gray-400">No members added to this group yet</p>
        </div>
      )}

      {/* Comments from the action */}
      {historyEntry?.comments && (
        <p className="text-xs text-gray-500 italic mt-2 px-1">
          "{historyEntry.comments}"
        </p>
      )}
    </div>
  );
}

// ── IndividualApprovalRow ─────────────────────────────────────────────────────

function IndividualApprovalRow({ level, approverName, isCompleted, isCurrent, wasRejected, isMyTurn, historyEntry }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      wasRejected ? "bg-red-50 border-red-200" :
      isCompleted ? "bg-green-50 border-green-200" :
      isCurrent ? "bg-amber-50 border-amber-200" :
      "bg-gray-50 border-gray-200"
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        wasRejected ? "bg-red-500 text-white" :
        isCompleted ? "bg-green-500 text-white" :
        isCurrent ? "bg-amber-500 text-white" :
        "bg-gray-300 text-gray-600"
      }`}>
        {level}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">{approverName}</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
            <User className="w-3 h-3" /> Individual
          </span>
        </div>
        <div className={`text-xs mt-0.5 ${
          wasRejected ? "text-red-600" :
          isCompleted ? "text-green-600" :
          isCurrent ? "text-amber-600" :
          "text-gray-500"
        }`}>
          {wasRejected ? "Rejected" :
           isCompleted ? "Approved" :
           isCurrent ? (isMyTurn ? "Awaiting your decision" : "Current Approver") :
           "Pending"}
        </div>
        {historyEntry?.comments && (
          <p className="text-xs text-gray-500 italic mt-0.5">"{historyEntry.comments}"</p>
        )}
      </div>
      {wasRejected && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
      {isCompleted && !wasRejected && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
      {isCurrent && <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

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

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await submissionApi.getSubmissionById(id);

      if (!res.success) {
        if (res.status === 403 || res.message?.toLowerCase().includes("access denied") || res.message?.toLowerCase().includes("not the current approver")) {
          toast("This submission has moved to the next approval level.", { icon: "ℹ️" });
          navigate("/employee/submissions");
          return;
        }
        setSubmission(null);
        setLoading(false);
        return;
      }

      const data = res.data;
      const template = data.formId;
      const flow = template?.approvalFlow || [];
      const currentLevel = data.currentLevel || 1;

      let isMyTurn = false;
      if (user) {
        const userId = user.userId || user._id || user.id;
        const isTerminal = data.status === "APPROVED" || data.status === "REJECTED";
        if (!isTerminal) {
          if (flow.length === 0) {
            isMyTurn = data.status === "PENDING_APPROVAL" || data.status === "SUBMITTED";
          } else {
            const currentLevelConfig = flow.find(f => Number(f.level) === Number(currentLevel));
            if (currentLevelConfig) {
              if (currentLevelConfig.type === "GROUP") {
                try {
                  if (currentLevelConfig.groupId && typeof currentLevelConfig.groupId === "object" && currentLevelConfig.groupId.members) {
                    isMyTurn = currentLevelConfig.groupId.members.some(m => {
                      const mId = typeof m === "object" ? m._id?.toString() : m?.toString();
                      return mId === String(userId);
                    });
                  } else {
                    const groupId = typeof currentLevelConfig.groupId === "object"
                      ? (currentLevelConfig.groupId._id || currentLevelConfig.groupId).toString()
                      : currentLevelConfig.groupId?.toString();
                    if (groupId) {
                      const { approvalGroupApi } = await import("../../api/approvalGroup.api");
                      const groupRes = await approvalGroupApi.getGroupById(groupId);
                      if (groupRes?.success && groupRes?.data?.members) {
                        isMyTurn = groupRes.data.members.some(m => {
                          const mId = typeof m === "object" ? m._id?.toString() : m?.toString();
                          return mId === String(userId);
                        });
                      }
                    }
                  }
                } catch (e) {
                  console.error("Group check failed:", e);
                }
              } else {
                const approverId = currentLevelConfig.approverId?._id || currentLevelConfig.approverId;
                isMyTurn = String(approverId).trim() === String(userId).trim();
              }
            }
          }
        }
      }

      let pendingApproverName = null;
      if (!isMyTurn && flow.length > 0) {
        const cfg = flow.find(f => f.level === currentLevel);
        if (cfg?.type === "GROUP") {
          pendingApproverName = cfg.groupName || cfg.name || "Approval Group";
          if (!pendingApproverName.toLowerCase().includes("group")) pendingApproverName += " (Group)";
        } else {
          pendingApproverName = cfg?.approverId?.name || "Current Approver";
        }
      }

      setSubmission({ ...data, isMyTurn, pendingApproverName });

      const responseData = data.data;
      let parsedFormData = {};
      if (responseData && typeof responseData === "object") {
        if (responseData.responses) parsedFormData = { ...responseData.responses };
        else if (responseData.data) parsedFormData = { ...responseData.data };
        else parsedFormData = { ...responseData };
      }
      if (Array.isArray(data.files)) {
        data.files.forEach(file => {
          if (file.fieldId && file.url) parsedFormData[file.fieldId] = file.url;
        });
      }
      setFormData(parsedFormData);
    } catch (error) {
      console.error("Error fetching approval data:", error);
      setSubmission(null);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const res = await approvalApi.processApproval({ submissionId: id, status: "approved", comments, data: formData });
      if (res.success) { toast.success("Approved successfully"); navigate("/employee/dashboard"); }
      else toast.error(res.message || "Failed to approve");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    } finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!comments.trim()) { toast.error("Please provide a reason for rejection"); return; }
    setProcessing(true);
    try {
      const res = await approvalApi.processApproval({ submissionId: id, status: "rejected", comments, data: formData });
      if (res.success) { toast.success("Rejected successfully"); setShowRejectModal(false); navigate("/employee/dashboard"); }
      else toast.error(res.message || "Failed to reject");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject");
    } finally { setProcessing(false); }
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
          <p className="text-gray-600 mb-6">The submission doesn't exist, has already been processed, or you don't have permission to view it.</p>
          <button onClick={() => navigate("/employee/dashboard")} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const template = submission.formId;
  const { approvalHistory, isMyTurn, pendingApproverName } = submission;
  const submitterName = submission.submittedBy?.name || "Employee";
  const flow = template?.approvalFlow || [];
  const currentLevel = submission.currentLevel || 1;
  const totalApprovers = flow.length;
  const completedApprovers = currentLevel - 1;
  // Only show progress bar if there are multiple levels (multi-level workflow)
  const hasMultiLevelWorkflow = flow.length > 1;

  const statusConfig = {
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, label: "Approved" },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, label: "Rejected" },
    PENDING_APPROVAL: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock, label: "Pending" },
    SUBMITTED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Send, label: "Submitted" },
  };
  const currentStatus = statusConfig[submission.status] || statusConfig.SUBMITTED;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate("/employee/dashboard")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Pending</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 px-6 py-8 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {template?.formName || template?.templateName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-indigo-100 text-sm">
                  <span className="inline-flex items-center gap-1.5"><User size={14} />{submitterName}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(submission.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
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
            {/* Approval Progress */}
            {totalApprovers > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Approval Progress
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">Level {currentLevel} of {totalApprovers}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      submission.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {submission.status === "APPROVED" ? "Completed" :
                       submission.status === "REJECTED" ? "Rejected" : "In Progress"}
                    </span>
                  </div>
                </div>

                {/* Progress bar — only for multi-level workflows */}
                {hasMultiLevelWorkflow && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-5">
                    <div
                     className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(completedApprovers / totalApprovers) * 100}%` }}
                    />
                  </div>
                )}

                {/* Per-level cards — GROUP vs INDIVIDUAL */}
                <div className="space-y-3">
                  {flow.map((level, index) => {
                    const isCompleted = index < currentLevel - 1;
                    const isCurrent = index === currentLevel - 1 &&
                      submission.status !== "APPROVED" && submission.status !== "REJECTED";
                    const historyEntry = approvalHistory?.find(h => h.level === level.level);
                    const wasRejected = historyEntry?.status === "REJECTED";

                    if (level.type === "GROUP") {
                      return (
                        <GroupApprovalPanel
                          key={level.level}
                          levelConfig={level}
                          approvalHistory={approvalHistory}
                          currentLevel={currentLevel}
                          submissionStatus={submission.status}
                        />
                      );
                    }

                    // Individual approver
                    const approverName = (() => {
                      const approver = level.approverId;
                      if (approver && typeof approver === "object" && approver.name) return approver.name;
                      return `Approver ${level.level}`;
                    })();

                    return (
                      <IndividualApprovalRow
                        key={level.level}
                        level={level.level}
                        approverName={approverName}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        wasRejected={wasRejected}
                        isMyTurn={isMyTurn}
                        historyEntry={historyEntry}
                      />
                    );
                  })}
                </div>

                {/* "Your turn" banner */}
                {isMyTurn && submission.status !== "APPROVED" && submission.status !== "REJECTED" && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-800">Your Turn to Approve</p>
                      <p className="text-sm text-blue-600">
                        {(() => {
                          const cfg = flow.find(f => f.level === currentLevel);
                          if (cfg?.type === "GROUP") {
                            const gName = cfg.groupName || cfg.name || "your group";
                            return `You are a member of ${gName} — any one member can approve this submission`;
                          }
                          return "You are the current approver for this submission";
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Waiting on someone else */}
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

            {/* Form data */}
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
                  key={`form-renderer-${id}-${Object.keys(formData).length}`}
                />
              </div>
            </div>

            {/* Approval timeline */}
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
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${isApproved ? "bg-emerald-100" : "bg-red-100"}`}>
                            {isApproved
                              ? <CheckCircle2 className="text-emerald-600" size={16} />
                              : <XCircle className="text-red-600" size={16} />
                            }
                          </div>
                          <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isApproved ? "text-emerald-700" : "text-red-700"}`}>
                                  Level {item.level} — {isApproved ? "Approved" : "Rejected"}
                                </span>
                                {item.isGroupApproval && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                    <Users className="w-3 h-3" />
                                    {item.groupName || "Group"}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">
                                {new Date(item.actionedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {item.isGroupApproval && (
                              <p className="text-xs text-indigo-600 mt-1">
                                Approved by a member of <strong>{item.groupName || "the group"}</strong>
                              </p>
                            )}
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

            {/* Action buttons */}
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

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
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
              <p className="text-xs text-slate-500 mt-2">The employee will receive this feedback via email.</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowRejectModal(false); setComments(""); }}
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
                  ) : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}