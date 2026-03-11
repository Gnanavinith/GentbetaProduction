import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle2, XCircle, Clock, User } from "lucide-react";

export default function RecentlyApprovedSidebar({ submissions = [], loading }) {
  const navigate = useNavigate();
  if (loading) {
   return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-3 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Recently Approved</h2>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">Your approval decisions</p>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-2.5 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-100 rounded-md" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2 bg-slate-50 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
   if (status?.toLowerCase() === 'approved') {
     return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
    } else if (status?.toLowerCase() === 'rejected') {
     return <XCircle className="w-3.5 h-3.5 text-red-600" />;
    }
   return <Clock className="w-3.5 h-3.5 text-indigo-600" />;
  };

  const getStatusBadge = (status) => {
   if (status?.toLowerCase() === 'approved') {
     return 'bg-green-50 text-green-700 border-green-200';
    } else if (status?.toLowerCase() === 'rejected') {
     return 'bg-red-50 text-red-700 border-red-200';
    }
   return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  const formatDate = (dateString) => {
   if (!dateString) return 'N/A';
   return new Date(dateString).toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).replace(',', '');
  };

  const getApprovalProgress = (submission) => {
   const totalLevels = submission.currentLevel || 1;
   const completedLevels = submission.approvalHistory?.length || 0;
   const percentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
    
   return {
      current: completedLevels,
     total: totalLevels,
      percentage
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-3 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Recently Approved</h2>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">Your approval decisions</p>
        </div>
        <button
          onClick={() => navigate('/employee/approval/history')}
         className="text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          View All
        </button>
      </div>
      
      {submissions.length === 0 ? (
        <div className="p-8 text-center text-slate-400 italic font-medium text-sm">
          No recent approvals found.
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
          {submissions.map((s) => {
           const progress = getApprovalProgress(s);
           const lastAction= s.approvalHistory?.[s.approvalHistory.length - 1];
            
           return (
              <div 
                key={s._id} 
               className="p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                onClick={() => navigate(`/employee/approval/detail/${s._id}`)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-50 group-hover:bg-white rounded-md flex items-center justify-center transition-colors shadow-sm">
                    {getStatusIcon(s.status)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-none mb-0.5">
                      {s.templateName || s.formId?.formName || "Unknown Form"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <User className="w-2.5 h-2.5 text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-500">
                        {lastAction?.approverName || s.submittedBy?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {formatDate(lastAction?.actionedAt || s.updatedAt)}
                  </p>
                  
                  {/* Approval Progress */}
                  <div className="flex items-center gap-1">
                    <div className="flex-1 w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                       className={`h-full rounded-full ${
                         s.status?.toLowerCase() === 'approved' 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500">
                      {progress.current}/{progress.total}
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusBadge(s.status)}`}>
                    {s.status === 'APPROVED' ? 'APPROVED' : s.status === 'REJECTED' ? 'REJECTED' : 'PENDING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Summary Footer */}
      {submissions.length > 0 && (
        <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-slate-600">
              {submissions.filter(s => s.status === 'APPROVED').length} Approved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-slate-600">
              {submissions.filter(s => s.status === 'REJECTED').length} Rejected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
