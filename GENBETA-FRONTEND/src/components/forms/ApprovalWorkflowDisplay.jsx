import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from "lucide-react";
import { userApi } from "../../api/user.api";

export default function ApprovalWorkflowDisplay({ form, className = "" }) {
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

  /**
   * Resolve approver details for each level.
   * Priority:
   *  1. Already-populated approverId object (has .name)
   *  2. API fetch by approverId string
   *  3. level.name / level.approverName fields
   *  4. Generic fallback
   */
  const resolveApprovers = async (approvalFlow) => {
    setLoading(true);
    try {
      const resolved = await Promise.all(
        approvalFlow.map(async (level, index) => {
          const levelNum = level.level || index + 1;

          // 1. approverId is already a populated object with a name
          if (level.approverId && typeof level.approverId === "object" && level.approverId.name) {
            return {
              ...level,
              _resolvedName: level.approverId.name,
              _resolvedEmail: level.approverId.email || null,
            };
          }

          // 2. Try fetching from API using the ID string
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

          // 3. Use any name-like field already on the level object
          const nameFromLevel = level.approverName || level.name;
          if (nameFromLevel && !nameFromLevel.toLowerCase().startsWith("approval level")) {
            return {
              ...level,
              _resolvedName: nameFromLevel,
              _resolvedEmail: null,
            };
          }

          // 4. Generic fallback
          return {
            ...level,
            _resolvedName: `Level ${levelNum} Approver`,
            _resolvedEmail: null,
          };
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

  const firstApprover = approvers[0];
  const pendingLabel = firstApprover?._resolvedName
    ? `${firstApprover._resolvedName} (Level ${firstApprover.level || 1})`
    : `Level 1 Approval`;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Approval Workflow</h3>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-600">
            {approvalFlow.length} level{approvalFlow.length > 1 ? "s" : ""} required for approval
          </p>
          {!loading && firstApprover && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                Pending: {pendingLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-500 mb-2">Loading approver details...</div>
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
          <div className="space-y-3">
            {approvers.map((level, index) => {
              const isLast = index === approvers.length - 1;
              const levelNum = level.level || index + 1;
              const description = level.description && !level.description.toLowerCase().includes("standard")
                ? level.description
                : null;

              return (
                <div key={levelNum} className="relative">
                  {!isLast && (
                    <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200 -translate-x-0.5" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Level badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-700">{levelNum}</span>
                    </div>

                    {/* Approver info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{level._resolvedName}</span>
                      </div>
                      <p className="text-sm text-gray-500">Approval Level {levelNum}</p>
                      {level._resolvedEmail && (
                        <p className="text-xs text-blue-600 mt-0.5">{level._resolvedEmail}</p>
                      )}
                      {description && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                        <Clock className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>Process</span>
            </div>
            <span className="text-gray-800 font-medium">Sequential approval required</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Each approver must review and approve before the next level can proceed
          </p>
        </div>
      </div>
    </div>
  );
}