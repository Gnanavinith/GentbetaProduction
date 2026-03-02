import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { userApi } from "../../api/user.api";

export default function ApprovalWorkflowDisplay({ form, submission, className = "" }) {
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const approvalFlow = form?.approvalFlow || form?.workflow || [];
    if (approvalFlow.length > 0) {
      resolveApprovers(approvalFlow);
    } else {
      setApprovers([]);
    }
  }, [form]);

  const resolveApprovers = async (approvalFlow) => {
    setLoading(true);
    try {
      const resolved = await Promise.all(
        approvalFlow.map(async (level, index) => {
          const levelNum = level.level || index + 1;

          // 1. Already-populated object with name
          if (level.approverId && typeof level.approverId === "object" && level.approverId.name) {
            return {
              ...level,
              _resolvedName: level.approverId.name,
              _resolvedEmail: level.approverId.email || null,
            };
          }

          // 2. Fetch from API
          const idStr = typeof level.approverId === "string"
            ? level.approverId
            : level.approverId?._id || null;

          if (idStr) {
            try {
              const res = await userApi.getUserById(idStr);
              if (res?.success && res?.data?.name) {
                return {
                  ...level,
                  _resolvedName: res.data.name,
                  _resolvedEmail: res.data.email || null,
                };
              }
            } catch {
              // fall through
            }
          }

          // 3. Name field on level
          const nameFromLevel = level.approverName || level.name;
          if (nameFromLevel && !nameFromLevel.toLowerCase().startsWith("approval level")) {
            return { ...level, _resolvedName: nameFromLevel, _resolvedEmail: null };
          }

          // 4. Fallback
          return { ...level, _resolvedName: `Level ${levelNum} Approver`, _resolvedEmail: null };
        })
      );
      setApprovers(resolved);
    } catch (err) {
      console.error("Error resolving approvers:", err);
      setApprovers(
        (form?.approvalFlow || form?.workflow || []).map((level, i) => ({
          ...level,
          _resolvedName: `Level ${level.level || i + 1} Approver`,
          _resolvedEmail: null,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Derive per-level status from submission ─────────────────────────────
  const getLevelStatus = (levelNum) => {
    if (!submission) return "pending";

    const history = submission.approvalHistory || [];
    const currentLevel = submission.currentLevel;
    const submissionStatus = submission.status;

    // Check if this level has a history entry
    const historyEntry = history.find(h => h.level === levelNum);
    if (historyEntry) {
      return historyEntry.status === "APPROVED" ? "approved" : "rejected";
    }

    // If submission is fully approved, all levels without history are implicitly approved
    if (submissionStatus === "APPROVED") return "approved";

    // If submission is rejected, levels beyond the rejected one are skipped
    if (submissionStatus === "REJECTED") return "skipped";

    // Current level awaiting action
    if (levelNum === currentLevel) return "current";

    // Future levels
    return "pending";
  };

  const getLevelHistoryComment = (levelNum) => {
    const history = (submission?.approvalHistory || []).find(h => h.level === levelNum);
    return history?.comments || null;
  };

  const getLevelActionedAt = (levelNum) => {
    const history = (submission?.approvalHistory || []).find(h => h.level === levelNum);
    return history?.actionedAt || null;
  };
  // ─────────────────────────────────────────────────────────────────────────

  const approvalFlow = form?.approvalFlow || form?.workflow || [];

  if (approvalFlow.length === 0) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Auto-Approval</p>
            <p className="text-sm text-green-600">
              This form will be automatically approved upon submission
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Overall progress summary
  const totalLevels = approvalFlow.length;
  const approvedCount = approvers.filter((_, i) => {
    const levelNum = approvers[i]?.level || i + 1;
    return getLevelStatus(levelNum) === "approved";
  }).length;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">Approval Workflow</h3>
          </div>
          {submission && (
            <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">
              {approvedCount}/{totalLevels} approved
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {totalLevels} level{totalLevels > 1 ? "s" : ""} required · Sequential approval
        </p>
      </div>

      {/* Steps */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Loading approver details...</p>
            {Array.from({ length: approvalFlow.length }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {approvers.map((level, index) => {
              const isLast = index === approvers.length - 1;
              const levelNum = level.level || index + 1;
              const status = getLevelStatus(levelNum);
              const comment = getLevelHistoryComment(levelNum);
              const actionedAt = getLevelActionedAt(levelNum);
              const description = level.description && !level.description.toLowerCase().includes("standard")
                ? level.description
                : null;

              // Visual config per status
              const statusConfig = {
                approved: {
                  badge: "bg-green-100 border-green-300",
                  badgeText: "text-green-700",
                  icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
                  label: "Approved",
                  labelClass: "text-green-700 bg-green-50 border border-green-200",
                  connector: "bg-green-200",
                },
                rejected: {
                  badge: "bg-red-100 border-red-300",
                  badgeText: "text-red-700",
                  icon: <XCircle className="w-4 h-4 text-red-600" />,
                  label: "Rejected",
                  labelClass: "text-red-700 bg-red-50 border border-red-200",
                  connector: "bg-gray-200",
                },
                current: {
                  badge: "bg-yellow-100 border-yellow-400",
                  badgeText: "text-yellow-800",
                  icon: <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />,
                  label: "Awaiting",
                  labelClass: "text-yellow-700 bg-yellow-50 border border-yellow-200",
                  connector: "bg-gray-200",
                },
                pending: {
                  badge: "bg-gray-100 border-gray-300",
                  badgeText: "text-gray-500",
                  icon: <Clock className="w-4 h-4 text-gray-400" />,
                  label: "Pending",
                  labelClass: "text-gray-500 bg-gray-50 border border-gray-200",
                  connector: "bg-gray-200",
                },
                skipped: {
                  badge: "bg-gray-100 border-gray-200",
                  badgeText: "text-gray-400",
                  icon: <Clock className="w-4 h-4 text-gray-300" />,
                  label: "—",
                  labelClass: "text-gray-400 bg-gray-50 border border-gray-100",
                  connector: "bg-gray-100",
                },
              };

              const cfg = statusConfig[status] || statusConfig.pending;

              return (
                <div key={levelNum} className="relative">
                  {/* Connector line */}
                  {!isLast && (
                    <div className={`absolute left-4 top-9 w-0.5 h-6 ${cfg.connector} -translate-x-px`} />
                  )}

                  <div className="flex items-start gap-3 py-2">
                    {/* Level circle */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${cfg.badge}`}>
                      <span className={`text-xs font-bold ${cfg.badgeText}`}>{levelNum}</span>
                    </div>

                    {/* Approver info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className={`font-medium ${status === "skipped" ? "text-gray-400" : "text-gray-900"}`}>
                          {level._resolvedName}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.labelClass}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {level._resolvedEmail && (
                        <p className="text-xs text-blue-500 mt-0.5">{level._resolvedEmail}</p>
                      )}
                      {description && (
                        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                      )}
                      {actionedAt && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(actionedAt).toLocaleString()}
                        </p>
                      )}
                      {comment && (
                        <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 mt-1 italic">
                          "{comment}"
                        </p>
                      )}
                    </div>

                    {/* Status icon */}
                    <div className="flex-shrink-0 mt-1">
                      {cfg.icon}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Each approver must act before the next level proceeds</span>
        </div>
      </div>
    </div>
  );
}