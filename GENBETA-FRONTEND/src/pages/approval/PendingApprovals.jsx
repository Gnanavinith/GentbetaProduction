import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { approvalApi } from '../../api/approval.api';
import { FileText, Clock, ChevronRight, AlertCircle, CheckCircle2, User, Eye, Check, X, Loader2 } from 'lucide-react';
import { SkeletonTable } from '../../components/common/Skeleton';
import { toast } from 'react-hot-toast';

export default function PendingApprovals() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const result = await approvalApi.getAssignedSubmissions();
    if (result.success) {
      setSubmissions(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleQuickAction = async (e, submissionId, status) => {
    e.stopPropagation();
    
    const confirmMessage = status === 'approved' 
      ? "Are you sure you want to approve this submission?" 
      : "Are you sure you want to reject this submission?";
      
    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(submissionId);
      const result = await approvalApi.processApproval({
        submissionId,
        status,
        comments: `Quick ${status} from pending list`
      });

      if (result.success) {
        toast.success(`Submission ${status} successfully`);
        fetchSubmissions();
      } else {
        toast.error(result.message || `Failed to ${status} submission`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 md:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">Pending Approvals</h1>
              <p className="text-slate-600 text-sm mt-1">Manage and review forms assigned to you for approval</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100/60 flex items-center gap-2 shadow-sm backdrop-blur-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
                <div>
                  <p className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wide">Your Turn</p>
                  <p className="text-base font-bold text-indigo-900">{submissions.filter(s => s.isMyTurn).length}</p>
                </div>
              </div>
              <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200/60 flex items-center gap-2 shadow-sm backdrop-blur-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Upcoming</p>
                  <p className="text-base font-bold text-slate-800">{submissions.filter(s => !s.isMyTurn).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-100/60 rounded-xl flex items-center gap-3 text-red-700 font-medium shadow-sm backdrop-blur-sm">
            <div className="p-1.5 bg-red-100/80 rounded-md backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 text-sm mb-0.5">Something went wrong</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonTable rows={5} columns={5} className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/60" />
        ) : (
          <>
            {submissions.length === 0 ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/60 p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-green-200/60 backdrop-blur-sm">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-green-800 bg-clip-text text-transparent mb-2">All caught up!</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">You don't have any forms waiting for your approval. Great job staying on top of your tasks!</p>
                <div className="mt-4 flex justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-bounce delay-200"></div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 border-b border-slate-200/60 backdrop-blur-sm">
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Form Details</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Submitted By</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Submitted On</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Current Status</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60">
                      {submissions.map((sub) => (
                        <tr 
                          key={sub._id}
                          className="hover:bg-slate-50/30 transition-all duration-200 cursor-pointer group backdrop-blur-sm"
                          onClick={() => navigate(`../approval/detail/${sub._id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg transition-all duration-200 backdrop-blur-sm ${sub.isMyTurn ? 'bg-gradient-to-br from-indigo-50/80 to-purple-50/80 text-indigo-600 ring-2 ring-indigo-100/60' : 'bg-gradient-to-br from-slate-50/80 to-slate-100/80 text-slate-400'}`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors text-sm bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                                      {sub.templateId?.formName || sub.formId?.formName || 'Untitled Form'}
                                  </h3>
                                  {sub.isMyTurn && (
                                      <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-[9px] font-extrabold text-white uppercase rounded-full shadow-sm animate-pulse backdrop-blur-sm">
                                          ACTION REQUIRED
                                      </span>
                                  )}
                                </div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">LEVEL {sub.userLevel || 1}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100/80 to-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200/60 shadow-sm backdrop-blur-sm">
                                {sub.submittedBy?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{sub.submittedBy?.name || 'Unknown User'}</p>
                                <p className="text-[10px] text-slate-500">Submitter</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm">
                                  {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                  {new Date(sub.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {sub.isMyTurn ? (
                              <div className="inline-flex items-center gap-1.5 text-indigo-700 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 px-3 py-1.5 rounded-full border border-indigo-200/60 shadow-sm animate-pulse backdrop-blur-sm">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-extrabold uppercase tracking-widest">YOUR TURN</span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <div className="inline-flex items-center gap-1.5 text-slate-600 bg-gradient-to-r from-slate-50/80 to-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm w-fit backdrop-blur-sm">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-extrabold uppercase tracking-widest">UPCOMING</span>
                                </div>
                                {sub.pendingApproverName && (
                                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50/80 px-2 py-1 rounded-full border border-amber-200/60 w-fit backdrop-blur-sm">
                                    <User className="w-3 h-3" />
                                    <span>Waiting for {sub.pendingApproverName}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => navigate(`../approval/detail/${sub._id}`)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-lg transition-all duration-200 group-hover:bg-indigo-100/80 backdrop-blur-sm"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {sub.isMyTurn && (
                                <>
                                  <button 
                                    disabled={actionLoading === sub._id}
                                    onClick={(e) => handleQuickAction(e, sub._id, 'approved')}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50/80 hover:text-emerald-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-emerald-100/80 backdrop-blur-sm"
                                    title="Quick Approve"
                                  >
                                    {actionLoading === sub._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button 
                                    disabled={actionLoading === sub._id}
                                    onClick={(e) => handleQuickAction(e, sub._id, 'rejected')}
                                    className="p-2 text-rose-600 hover:bg-rose-50/80 hover:text-rose-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-rose-100/80 backdrop-blur-sm"
                                    title="Quick Reject"
                                  >
                                    {actionLoading === sub._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </button>
                                </>
                              )}
                              
                              {!sub.isMyTurn && (
                                <div className="p-2 text-slate-300 bg-slate-50/80 rounded-lg backdrop-blur-sm" title="Waiting for previous level">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Table Footer Summary */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50/80 to-slate-100/80 border-t border-slate-200/60 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">Total: <span className="text-slate-900 font-bold">{submissions.length}</span></span>
                      <span className="font-medium">Your Turn: <span className="text-indigo-700 font-bold">{submissions.filter(s => s.isMyTurn).length}</span></span>
                      <span className="font-medium">Upcoming: <span className="text-slate-700 font-bold">{submissions.filter(s => !s.isMyTurn).length}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
                      <span>Live Updates</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}