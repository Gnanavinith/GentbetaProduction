import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submissionApi } from "../../api/submission.api";
import { approvalGroupApi } from "../../api/approvalGroup.api";
import {
  CheckCircle2, XCircle, Clock, FileText, User,
  Calendar, ChevronRight, Filter, Users
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString)
    .toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    })
    .replace(",", "");
};

// Fetch group details (members + who approved) for a given history entry
async function resolveGroupInfo(submission) {
  try {
    const form = submission.formId;
    const flow = form?.approvalFlow || [];
    const groupLevels = flow.filter(f => f.type === "GROUP");
    if (groupLevels.length === 0) return null;

    // Use first group level that has a history entry
    const firstGroupLevel = groupLevels[0];
    const groupId =
      typeof firstGroupLevel.groupId === "object"
        ? firstGroupLevel.groupId._id?.toString()
        : firstGroupLevel.groupId?.toString();

    if (!groupId) return null;

    const res = await approvalGroupApi.getGroupById(groupId);
    if (!res?.success) return null;

    const groupName =
      firstGroupLevel.groupName ||
      firstGroupLevel.name ||
      res.data?.groupName ||
      "Approval Group";

    const members = res.data?.members || [];

    // Find who actually approved from approvalHistory
    const approvedEntry = submission.approvalHistory?.find(
      h => h.isGroupApproval && (h.status === "APPROVED" || h.status === "REJECTED")
    );

    return { groupName, members, approvedEntry };
  } catch {
    return null;
  }
}

// ── GroupMembersList ──────────────────────────────────────────────────────────

function GroupMembersList({ groupName, members, approvedEntry }) {
  const approvedById = approvedEntry?.approverId?.toString();

  return (
    <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
          {groupName}
        </span>
        <span className="text-xs text-indigo-400">· any one approval needed</span>
      </div>
      <div className="space-y-1.5">
        {members.map((m) => {
          const memberId = (typeof m === "object" ? m._id : m)?.toString();
          const memberName = typeof m === "object" ? m.name : `Member`;
          const didApprove = approvedById && memberId === approvedById;
          const isRejected = didApprove && approvedEntry?.status === "REJECTED";

          return (
            <div
              key={memberId}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                isRejected
                  ? "bg-red-50 border border-red-200"
                  : didApprove
                  ? "bg-green-50 border border-green-200"
                  : "bg-white border border-indigo-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isRejected ? "bg-red-200 text-red-700"
                  : didApprove ? "bg-green-200 text-green-700"
                  : "bg-indigo-100 text-indigo-500"
                }`}>
                  {memberName?.[0]?.toUpperCase() || "?"}
                </div>
                <span className={`font-medium ${
                  isRejected ? "text-red-700"
                  : didApprove ? "text-green-700"
                  : "text-slate-600"
                }`}>
                  {memberName}
                </span>
              </div>
              {isRejected && (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                  <XCircle className="w-3.5 h-3.5" /> Rejected
                </span>
              )}
              {didApprove && !isRejected && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
              )}
              {!didApprove && (
                <span className="text-xs text-slate-400">Pending</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SubmissionCard ────────────────────────────────────────────────────────────

function SubmissionCard({ s, navigate }) {
  const [groupInfo, setGroupInfo] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const flow = s.formId?.approvalFlow || [];
  const isGroupApproval = flow.some(f => f.type === "GROUP");
  // Only show progress bar if there are multiple levels (multi-level workflow)
  const hasMultiLevelWorkflow = flow.length > 1;

  const lastAction = s.approvalHistory?.[s.approvalHistory.length - 1];
  const completedLevels = s.approvalHistory?.length || 0;
  const totalLevels = s.currentLevel || 1;
  const percentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 100;

  const handleExpand = async (e) => {
    e.stopPropagation();
    if (!isGroupApproval) return;
    if (groupInfo) { setExpanded(v => !v); return; }
    setLoadingGroup(true);
    const info = await resolveGroupInfo(s);
    setGroupInfo(info);
    setLoadingGroup(false);
    setExpanded(true);
  };

  return (
    <div
      className="p-4 hover:bg-slate-50 transition-colors"
      onClick={() => navigate(`/employee/approval/detail/${s._id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">
            {s.status === "APPROVED"
              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-red-600" />
            }
          </div>

          <div className="flex-1">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate-900">
                {s.templateName || s.formId?.formName || "Unknown Form"}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                s.status === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {s.status}
              </span>
              {isGroupApproval && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  <Users className="w-3 h-3" /> Group
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-slate-400" />
                <span>{lastAction?.approverName || s.submittedBy?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(lastAction?.actionedAt || s.updatedAt)}</span>
              </div>
            </div>

            {/* Progress bar — only for multi-level workflows */}
            {hasMultiLevelWorkflow && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                   className={`h-full rounded-full ${
                      s.status === "APPROVED" ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                  {completedLevels}/{totalLevels} levels
                </span>
              </div>
            )}

            {/* Group expand button */}
            {isGroupApproval && (
              <button
                onClick={handleExpand}
                className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                {loadingGroup ? "Loading members…" : expanded ? "Hide group members" : "Show group members"}
              </button>
            )}

            {/* Group members list */}
            {expanded && groupInfo && (
              <GroupMembersList
                groupName={groupInfo.groupName}
                members={groupInfo.members}
                approvedEntry={groupInfo.approvedEntry}
              />
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ApprovalHistory() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const result = await submissionApi.getSubmissions();
      if (result.success) {
        setSubmissions(
          result.data.filter(s => s.status === "APPROVED" || s.status === "REJECTED")
        );
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions =
    filter === "ALL" ? submissions : submissions.filter(s => s.status === filter);

  const stats = {
    total: submissions.length,
    approved: submissions.filter(s => s.status === "APPROVED").length,
    rejected: submissions.filter(s => s.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Approval History</h1>
              <p className="text-slate-600 text-sm mt-1">View all your approved and rejected submissions</p>
            </div>
            <button
              onClick={() => navigate("/employee/dashboard")}
              className="px-4 py-2 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Decisions", value: stats.total, color: "text-slate-900", bg: "bg-indigo-50", icon: <FileText className="w-6 h-6 text-indigo-600" /> },
            { label: "Approved", value: stats.approved, color: "text-green-600", bg: "bg-green-50", icon: <CheckCircle2 className="w-6 h-6 text-green-600" /> },
            { label: "Rejected", value: stats.rejected, color: "text-red-600", bg: "bg-red-50", icon: <XCircle className="w-6 h-6 text-red-600" /> },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>
                  {icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2">
          <div className="flex items-center gap-2">
            {[
              { key: "ALL", label: `All (${submissions.length})`, active: "bg-indigo-600" },
              { key: "APPROVED", label: `Approved (${stats.approved})`, active: "bg-green-600" },
              { key: "REJECTED", label: `Rejected (${stats.rejected})`, active: "bg-red-600" },
            ].map(({ key, label, active }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === key ? `${active} text-white` : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Recent Decisions</h2>
            </div>
            <span className="text-sm text-slate-500">
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto" />
              <p className="text-slate-500 mt-2">Loading submissions…</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No submissions found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSubmissions.map(s => (
                <SubmissionCard key={s._id} s={s} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}