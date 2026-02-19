import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { assignmentApi } from "../../api/assignment.api";
import { approvalApi } from "../../api/approval.api";
import { submissionApi } from "../../api/submission.api";
import { analyticsApi } from "../../api/analytics.api";
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  FileText,
  User,
  Layers,
  History,
  Sparkles,
  ArrowRight,
  PlusCircle,
  LayoutGrid,
  BarChart3,
  AlertCircle,
  Download,

  TrendingUp
} from "lucide-react";
import StatCard from "../../components/analytics/StatCard";
import BarChart from "../../components/analytics/BarChart";
import PieChart from "../../components/analytics/PieChart";
import LineChart from "../../components/analytics/LineChart";
import { exportToExcel, formatSubmissionsForExport } from "../../utils/excelExport";

function StatCardSkeleton() {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex items-center gap-2 animate-pulse">
      <div className="w-8 h-8 bg-slate-100 rounded-md" />
      <div className="space-y-1.5">
        <div className="h-2.5 w-16 bg-slate-100 rounded" />
        <div className="h-5 w-12 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-pulse">
      <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
      <div className="h-48 bg-slate-50 rounded-2xl flex items-end justify-center gap-3 p-4">
        {[40, 65, 50, 80, 55].map((h, i) => (
          <div key={i} className="w-8 bg-slate-100 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function RecentSubmissionSkeleton() {
  return (
    <div className="p-3 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-100 rounded" />
          <div className="h-3 w-20 bg-slate-50 rounded" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-3 w-24 bg-slate-50 rounded ml-auto" />
        <div className="h-5 w-16 bg-slate-100 rounded-full ml-auto" />
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ pendingCount: 0, completedCount: 0, totalSubmissions: 0 });
  const [tasks, setTasks] = useState([]);
  const [bulkTasks, setBulkTasks] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [chartData, setChartData] = useState({ 
    statusDistribution: {}, 
    submissionsPerForm: [], 
    submissionsTrend: [], 
    submissionsByUser: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes, bulkRes, submissionRes, analyticsRes] = await Promise.all([
        assignmentApi.getTaskStats(),
        assignmentApi.getAssignedTasks(),
        approvalApi.getApprovalTasks("PENDING"),
        submissionApi.getSubmissions(),
        analyticsApi.getDashboardAnalytics(30)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (bulkRes.success) setBulkTasks(bulkRes.data);
      const submissions = submissionRes.success ? submissionRes.data : [];
      if (submissionRes.success) setAllSubmissions(submissions);
      
      // Process analytics data
      const analytics = analyticsRes.success ? analyticsRes.data : {};
      
      // Process Status Distribution
      const statusCounts = submissions.reduce((acc, s) => {
        const status = s.status?.toLowerCase() || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // Process Submissions per Form
      const formCounts = submissions.reduce((acc, s) => {
        const formName = s.templateName || s.formId?.formName || "Unknown Form";
        acc[formName] = (acc[formName] || 0) + 1;
        return acc;
      }, {});
      const barData = Object.entries(formCounts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Process Submissions Trend (Last 7 Days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();
      
      const trendData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        count: submissions.filter(s => s.createdAt?.startsWith(date)).length
      }));

      // Process Submissions by User
      const userCounts = submissions.reduce((acc, s) => {
        const userName = typeof s.submittedBy === 'object' ? s.submittedBy?.name : s.submittedBy || "Unknown";
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
      }, {});
      const userBarData = Object.entries(userCounts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setChartData({ 
        statusDistribution: statusCounts, 
        submissionsPerForm: barData, 
        submissionsTrend: trendData,
        submissionsByUser: userBarData
      });
      
      setRecentSubmissions(submissions.slice(0, 10));

      if (!statsRes.success || !tasksRes.success || !bulkRes.success || !submissionRes.success) {
        toast.error("Failed to load some dashboard data");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).replace(',', '');
  }, []);

  const handleExport = useCallback(() => {
    if (allSubmissions.length === 0) {
      toast.error("No submissions to export");
      return;
    }
    exportToExcel(formatSubmissionsForExport(allSubmissions), `employee_submissions_report`, 'Submissions');
  }, [allSubmissions]);

  const statCards = useMemo(() => [
    { title: "Pending Tasks", value: stats.pendingCount, icon: <Clock className="w-5 h-5" />, color: "amber" },
    { title: "Completed Tasks", value: stats.completedCount, icon: <CheckCircle2 className="w-5 h-5" />, color: "green" },
    { title: "Total Submissions", value: allSubmissions.length, icon: <FileText className="w-5 h-5" />, color: "blue" },
    { title: "Active Status", value: stats.pendingCount + stats.completedCount, icon: <User className="w-5 h-5" />, color: "indigo" },
  ], [stats, allSubmissions]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-[1600px] mx-auto pb-6">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Welcome {user?.name}!</h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Overview of {user?.name}'s tasks and submissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-200 transition-all shadow-sm text-sm opacity-50">
                <Download className="w-4 h-4" /> Export
              </div>
              <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md shadow-indigo-100 transition-all text-sm opacity-50">
                <PlusCircle className="w-4 h-4" /> Create Submission
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <ChartSkeleton />
            </div>
            <div className="lg:col-span-1">
              <ChartSkeleton />
            </div>
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <div className="lg:col-span-1">
              <ChartSkeleton />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-3 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Assigned Tasks</h2>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">Direct assignments awaiting your action</p>
                </div>
                <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg opacity-50">View All</div>
              </div>
              <div className="p-8 text-center text-slate-400 italic font-medium text-sm opacity-50">Loading assignments...</div>
            </div>

            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-3 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Submissions</h2>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">Latest activity</p>
                </div>
                <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg opacity-50">View All</div>
              </div>
              <div className="divide-y divide-slate-50">
                {Array.from({ length: 5 }).map((_, i) => <RecentSubmissionSkeleton key={i} />)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <h2 className="text-base font-bold text-slate-900 mb-2 tracking-tight">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-1.5 opacity-50">
                  <div className="flex items-center gap-2 p-2 rounded-md border border-slate-100">
                    <div className="p-1.5 bg-indigo-50 rounded-md"><PlusCircle className="w-3.5 h-3.5 text-indigo-600" /></div>
                    <div><p className="font-black text-xs text-slate-900">Create Submission</p><p className="text-[9px] font-bold text-slate-400">Fill a new form</p></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md border border-slate-100">
                    <div className="p-1.5 bg-purple-50 rounded-md"><ClipboardCheck className="w-3.5 h-3.5 text-purple-600" /></div>
                    <div><p className="font-black text-xs text-slate-900">View Assignments</p><p className="text-[9px] font-bold text-slate-400">Check assigned tasks</p></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md border border-slate-100">
                    <div className="p-1.5 bg-emerald-50 rounded-md"><Download className="w-3.5 h-3.5 text-emerald-600" /></div>
                    <div><p className="font-black text-xs text-slate-900">Generate Report</p><p className="text-[9px] font-bold text-slate-400">Download history</p></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-600 p-3 rounded-lg shadow-xl shadow-indigo-200 text-white relative overflow-hidden opacity-50">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <TrendingUp className="w-6 h-6 mb-1.5 opacity-50" />
                <h3 className="text-sm font-black mb-0.5 tracking-tight">Performance</h3>
                <p className="text-[9px] font-bold text-indigo-100 mb-2">Your submission activity.</p>
                <div className="h-1 w-full bg-indigo-500 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[85%]" />
                </div>
                <p className="text-[9px] font-black mt-1.5 uppercase tracking-widest text-indigo-200">85% Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-6">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Welcome {user?.name}!</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Overview of {user?.name}'s tasks and submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-200 transition-all shadow-sm text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button 
              onClick={() => navigate('/employee/templates')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md shadow-indigo-100 transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Create Submission
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <LineChart data={chartData.submissionsTrend} title="Submissions Trend" />
          </div>
          <div className="lg:col-span-1">
            <PieChart data={chartData.statusDistribution} title="Submission Status" />
          </div>
          <div className="lg:col-span-2">
            <BarChart data={chartData.submissionsPerForm} title="Most Submitted Forms" xLabel="Form Name" yLabel="Submissions" />
          </div>
          <div className="lg:col-span-1">
            <BarChart data={chartData.submissionsByUser} title="My Submission Activity" xLabel="User" yLabel="Submissions" />
          </div>
        </div>

        {/* Bundle Approvals Section */}
        {bulkTasks.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bundle Approvals</h2>
                  <p className="text-slate-500 text-xs">Multi-permit processing queues that require authorization</p>
                </div>
              </div>
              <div className="h-px flex-1 bg-slate-200 mx-8 hidden lg:block" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bulkTasks.map((bt) => (
                <div 
                  key={bt._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900 leading-none">{bt.formIds?.length}</p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Permits in bundle</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Submitted By</p>
                        <p className="text-sm font-bold text-slate-700">{bt.submittedBy?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {bt.formIds?.slice(0, 3).map((f, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white text-[10px] font-semibold text-slate-500 rounded-lg border border-slate-200">
                          {f.formName?.length > 15 ? f.formName.substring(0, 15) + '...' : f.formName}
                        </span>
                      ))}
                      {bt.formIds?.length > 3 && (
                        <span className="px-2.5 py-1 bg-indigo-50 text-[10px] font-semibold text-indigo-600 rounded-lg border border-indigo-100">
                          +{bt.formIds.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/employee/bulk-approval/${bt._id}`)}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-100 flex items-center justify-center gap-2 group/btn"
                  >
                    Review Bundle
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Assigned Tasks Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-3 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Assigned Tasks</h2>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">Direct assignments awaiting your action</p>
              </div>
              <button 
                onClick={() => navigate('/employee/assignments')}
                className="text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View All
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic font-medium text-sm">No active assignments found.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {tasks.map((task) => (
                  <div key={task._id} className="p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-50 group-hover:bg-white rounded-md flex items-center justify-center transition-colors shadow-sm"><FileText className="w-3.5 h-3.5 text-slate-400" /></div>
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-none mb-0.5">
                          {task.templateId?.templateName || task.templateId?.formName || "Untitled Form"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500">{task.assignedBy?.name || "System Admin"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                        {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      <button
                        onClick={() => navigate(`/employee/fill-assignment/${task._id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Submissions Section */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-3 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Submissions</h2>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">Latest activity</p>
              </div>
              <button 
                onClick={() => navigate('/employee/submissions')}
                className="text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {recentSubmissions.length > 0 ? recentSubmissions.map((s) => (
                <div key={s._id} className="p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-slate-50 group-hover:bg-white rounded-md flex items-center justify-center transition-colors shadow-sm"><FileText className="w-3.5 h-3.5 text-slate-400" /></div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-none mb-0.5">{s.templateName || s.formId?.formName || "Unknown Form"}</p>
                      <p className="text-[10px] font-bold text-slate-500">{typeof s.submittedBy === 'object' ? s.submittedBy?.name : s.submittedBy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">{formatDate(s.createdAt)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      s.status?.toLowerCase() === 'approved' ? 'bg-green-50 text-green-600' : 
                      s.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-600' : 
                      'bg-indigo-50 text-indigo-600'
                    }`}>
                      {s.status?.toUpperCase() === 'PENDING_APPROVAL' ? `LVL ${s.currentLevel || 1} PENDING` : s.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              )) : <div className="p-8 text-center text-slate-400 italic font-medium text-sm">No recent submissions found.</div>}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-2 tracking-tight">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-1.5">
                <button 
                  onClick={() => navigate('/employee/templates')}
                  className="flex items-center gap-2 p-2 rounded-md border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group w-full text-left"
                >
                  <div className="p-1.5 bg-indigo-50 group-hover:bg-white rounded-md transition-colors"><PlusCircle className="w-3.5 h-3.5 text-indigo-600" /></div>
                  <div><p className="font-black text-xs text-slate-900">Create Submission</p><p className="text-[9px] font-bold text-slate-400">Fill a new form</p></div>
                </button>
                <button 
                  onClick={() => navigate('/employee/assignments')}
                  className="flex items-center gap-2 p-2 rounded-md border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all group w-full text-left"
                >
                  <div className="p-1.5 bg-purple-50 group-hover:bg-white rounded-md transition-colors"><ClipboardCheck className="w-3.5 h-3.5 text-purple-600" /></div>
                  <div><p className="font-black text-xs text-slate-900">View Assignments</p><p className="text-[9px] font-bold text-slate-400">Check assigned tasks</p></div>
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 p-2 rounded-md border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group w-full text-left"
                >
                  <div className="p-1.5 bg-emerald-50 group-hover:bg-white rounded-md transition-colors"><Download className="w-3.5 h-3.5 text-emerald-600" /></div>
                  <div><p className="font-black text-xs text-slate-900">Generate Report</p><p className="text-[9px] font-bold text-slate-400">Download history</p></div>
                </button>
              </div>
            </div>
            
            <div className="bg-indigo-600 p-3 rounded-lg shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <TrendingUp className="w-6 h-6 mb-1.5 opacity-50" />
              <h3 className="text-sm font-black mb-0.5 tracking-tight">Performance</h3>
              <p className="text-[9px] font-bold text-indigo-100 mb-2">Your submission activity.</p>
              <div className="h-1 w-full bg-indigo-500 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[85%]" />
              </div>
              <p className="text-[9px] font-black mt-1.5 uppercase tracking-widest text-indigo-200">85% Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
