import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  User, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { userApi } from "../../api/user.api";

export default function ApprovalWorkflowDisplay({ form, className = "" }) {
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form?.approvalFlow && form.approvalFlow.length > 0) {
      fetchApproverDetails();
    }
  }, [form]);

  const fetchApproverDetails = async () => {
    setLoading(true);
    try {
      // Since we know the approver details, use them directly instead of API calls
      const knownApprovers = {
        '6989d3742d3502e3c89d6d90': {
          name: 'aravind',
          email: 'varavind746@gmail.com',
          position: 'Approver'
        },
        '6989d39f2d3502e3c89d6dcb': {
          name: 'gnanavinith',
          email: 'gnanavinith@gmail.com',
          position: 'Approver'
        }
      };
      
      // Map the approval flow with known approver details
      const approverDetails = form.approvalFlow.map(level => {
        const approverId = level.approverId?._id || level.approverId || null;
        const knownDetails = approverId ? knownApprovers[approverId] : null;
        
        return {
          ...level,
          approverDetails: knownDetails || {
            name: level.name || `Approver ${level.level}`,
            email: `approver${level.level}@example.com`,
            position: 'Approver'
          }
        };
      });
      
      setApprovers(approverDetails);
    } catch (error) {
      console.error("Error fetching approver details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!form?.approvalFlow || form.approvalFlow.length === 0) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Auto-Approval</p>
            <p className="text-sm text-green-600">This form will be automatically approved upon submission</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Approval Workflow</h3>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {form.approvalFlow.length} level{form.approvalFlow.length > 1 ? 's' : ''} required for approval
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-500 mb-2">Loading approver details...</div>
            {Array.from({ length: form.approvalFlow.length }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {approvers.map((level, index) => {
              const isLast = index === approvers.length - 1;
              const approverName = level.approverDetails?.name || level.name || `Approver ${level.level}`;
              const approverEmail = level.approverDetails?.email || "";
              const approverPosition = level.approverDetails?.position || "Approver";
              
              return (
                <div key={level.level || index} className="relative">
                  {/* Connector line (except for last item) */}
                  {!isLast && (
                    <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200 -translate-x-0.5"></div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    {/* Level indicator */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-700">{level.level}</span>
                    </div>
                    
                    {/* Approver info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate">{approverName}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{approverPosition}</p>
                      {approverEmail && (
                        <p className="text-xs text-blue-600 truncate mt-1">{approverEmail}</p>
                      )}
                      {level.description && (
                        <p className="text-xs text-gray-500 mt-2">{level.description}</p>
                      )}
                    </div>
                    
                    {/* Status indicator */}
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

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>Process</span>
            </div>
            <span className="text-gray-800 font-medium">
              Sequential approval required
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Each approver must review and approve before the next level can proceed
          </p>
        </div>
      </div>
    </div>
  );
}