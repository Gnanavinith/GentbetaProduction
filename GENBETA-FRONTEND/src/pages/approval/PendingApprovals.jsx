import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { approvalApi } from '../../api/approval.api';
import { FileText, Clock, ChevronRight, AlertCircle, CheckCircle2, User, Eye, Check, X, Loader2 } from 'lucide-react';
import { SkeletonTable } from '../../components/common/Skeleton.jsx';
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
    <div className="min-h-full bg-slate-50 p-3 md:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
              <p className="text-slate-600 text-sm mt-1">Manage and review forms assigned to you for approval</p>
            </div>
            <div className="flex gap-3">
              <div className="px-3 py-2 bg-indigo-50 rounded-md border border-indigo-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <div>
                  <p className="text-xs font-medium text-indigo-700">Your Turn</p>
                  <p className="text-lg font-bold text-indigo-900">{submissions.filter(s => s.isMyTurn).length}</p>
                </div>
              </div>
              <div className="px-3 py-2 bg-slate-100 rounded-md border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Upcoming</p>
                  <p className="text-lg font-bold text-slate-800">{submissions.filter(s => !s.isMyTurn).length}</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/employee/dashboard")}
                className="px-4 py-2 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : (
          <>
            {submissions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">All caught up!</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6">You don't have any forms waiting for your approval.</p>
                <button 
                  onClick={() => navigate("/employee/dashboard")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Form Details</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Submitted By</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Submitted On</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {submissions.map((sub) => (
                        <tr 
                          key={sub._id}
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => navigate(`/employee/approval/detail/${sub._id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-md ${sub.isMyTurn ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-slate-900">
                                    {sub.templateId?.formName || sub.formId?.formName || 'Untitled Form'}
                                  </h3>
                                  {sub.isMyTurn && (
                                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">
                                      Action Required
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500">Level {sub.userLevel || 1}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-200 rounded-md flex items-center justify-center text-slate-700 font-medium text-sm">
                                {sub.submittedBy?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{sub.submittedBy?.name || 'Unknown User'}</p>
                                <p className="text-xs text-slate-500">Submitter</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="text-sm font-medium text-slate-800">
                                {new Date(sub.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-slate-500 block">
                                {new Date(sub.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {sub.isMyTurn ? (
                              <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                Your Turn
                              </div>
                            ) : (
                              <div>
                                <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium">
                                  <Clock className="w-3.5 h-3.5" />
                                  Upcoming
                                </div>
                                {sub.pendingApproverName && (
                                  <p className="text-xs text-amber-700 mt-1">
                                    Waiting for {sub.pendingApproverName}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => navigate(`/employee/approval/detail/${sub._id}`)}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {sub.isMyTurn && (
                                <>
                                  <button 
                                    disabled={actionLoading === sub._id}
                                    onClick={(e) => handleQuickAction(e, sub._id, 'approved')}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
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
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
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
                                <div className="p-2 text-slate-300">
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
                
                {/* Simple Footer Summary */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Total: <span className="font-semibold text-slate-900">{submissions.length}</span></span>
                    <span>Your Turn: <span className="font-semibold text-indigo-700">{submissions.filter(s => s.isMyTurn).length}</span></span>
                    <span>Upcoming: <span className="font-semibold text-slate-700">{submissions.filter(s => !s.isMyTurn).length}</span></span>
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