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
      // Map the approval flow with approver details
      // First try to get the approver details from the API
      const approverDetailsPromises = form.approvalFlow.map(async (level) => {
        const approverId = level.approverId?._id || level.approverId || null;
        
        if (approverId) {
          try {
            // Try to fetch actual user details
            const response = await userApi.getUserById(approverId);
            if (response.success && response.data) {
              return {
                ...level,
                approverDetails: {
                  name: response.data.name,
                  email: response.data.email,
                  position: response.data.role || 'Approver'
                }
              };
            }
          } catch (err) {
            console.warn(`Could not fetch details for approver ${approverId}:`, err);
          }
        }
        
        // Fallback to available information
        // Check if approver details are already populated
        if (level.approverId && typeof level.approverId === 'object' && level.approverId.name) {
          return {
            ...level,
            approverDetails: {
              name: level.approverId.name,
              email: level.approverId.email || `approver${level.level || (form.approvalFlow.indexOf(level) + 1)}@example.com`,
              position: level.description || 'Approver'
            }
          };
        }
                
        return {
          ...level,
          approverDetails: {
            name: level.name || `Approver ${level.level || (form.approvalFlow.indexOf(level) + 1)}`,
            email: `approver${level.level || (form.approvalFlow.indexOf(level) + 1)}@example.com`,
            position: level.description || 'Approver'
          }
        };
      });
      
      const approverDetails = await Promise.all(approverDetailsPromises);
      setApprovers(approverDetails);
    } catch (error) {
      console.error("Error fetching approver details:", error);
      // Fallback: set approvers with basic information
      const fallbackApprovers = form.approvalFlow.map((level, index) => {
        // Check if approver details are already populated
        if (level.approverId && typeof level.approverId === 'object' && level.approverId.name) {
          return {
            ...level,
            approverDetails: {
              name: level.approverId.name,
              email: level.approverId.email || `approver${level.level || (index + 1)}@example.com`,
              position: level.description || 'Approver'
            }
          };
        }
        
        return {
          ...level,
          approverDetails: {
            name: level.name || `Approver ${level.level || (index + 1)}`,
            email: `approver${level.level || (index + 1)}@example.com`,
            position: level.description || 'Approver'
          }
        };
      });
      setApprovers(fallbackApprovers);
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

  // Find current pending approver
  const currentPendingApprover = form.approvalFlow.find(level => level.level === 1) || form.approvalFlow[0];

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
            {form.approvalFlow.length} level{form.approvalFlow.length > 1 ? 's' : ''} required for approval
          </p>
          {currentPendingApprover && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                Pending: {currentPendingApprover.approverDetails?.name || currentPendingApprover.approverId?.name || currentPendingApprover.name || `Approver ${currentPendingApprover.level}`}
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
              const approverName = level.approverDetails?.name || level.name || `Approver ${level.level || (index + 1)}`;
              const approverEmail = level.approverDetails?.email || `approver${level.level || (index + 1)}@example.com`;
              const approverPosition = level.approverDetails?.position || level.description || "Approver";
              
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
                        <span className="font-medium text-gray-900">{approverName}</span>
                      </div>
                      <p className="text-sm text-gray-600">{approverPosition}</p>
                      {approverEmail && (
                        <p className="text-xs text-blue-600 mt-1">{approverEmail}</p>
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