import { useState, useEffect } from "react";
import { Factory, FileText, CheckCircle2, TrendingUp, AlertCircle, Clock, Crown, Phone, Users, Download, ArrowRight, Activity } from "lucide-react";
import api from "../../api/api";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPlanById } from "../../config/plans";
import BarChart from "../../components/analytics/BarChart";
import LineChart from "../../components/analytics/LineChart";
import PieChart from "../../components/analytics/PieChart";
import StatCard from "../../components/analytics/StatCard";
import { SkeletonCard } from "../../components/common/Skeleton";
import { exportToExcel, formatSubmissionsForExport } from "../../utils/excelExport";

export default function CompanyAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPlants: 0,
    totalFacilitys: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0
  });
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
      statusDistribution: {},
      plantDistribution: [],
      submissionTrend: [],
      topFacilitys: [],
      topContributors: [],
      approvalDistribution: {}
    });

  useEffect(() => {
    fetchDashboardData();
    fetchSubscriptionStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [plantsRes, formsRes, submissionsRes] = await Promise.all([
        api.get("/api/plants"),
        api.get("/api/forms"),
        api.get("/api/submissions")
      ]);

      const subsData = submissionsRes.data?.data || (Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
      const formsData = formsRes.data?.data || (Array.isArray(formsRes.data) ? formsRes.data : []);
      const plantsData = Array.isArray(plantsRes.data) ? plantsRes.data : [];

      setAllSubmissions(subsData);

      setStats({
        totalPlants: plantsData.length,
        totalFacilitys: formsData.length,
        totalSubmissions: subsData.length,
        pendingSubmissions: subsData.filter(s => s.status === "submitted" || s.status === "PENDING_APPROVAL").length
      });

      setRecentSubmissions(subsData.slice(0, 5));
      processChartData(subsData, plantsData);
    } catch (err) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

    const processChartData = (submissions, plants) => {
      // Status Distribution
      const statusMap = {
        pending: submissions.filter(s => s.status === "submitted" || s.status === "PENDING_APPROVAL").length,
        approved: submissions.filter(s => s.status === "approved" || s.status === "APPROVED").length,
        rejected: submissions.filter(s => s.status === "rejected" || s.status === "REJECTED").length
      };

      // Plant Distribution
      const plantCounts = {};
      submissions.forEach(s => {
        const plantName = s.plantName || s.plantId?.name || "Other";
        plantCounts[plantName] = (plantCounts[plantName] || 0) + 1;
      });
      const plantDist = Object.entries(plantCounts).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);

      // Submission Trend (Last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const trend = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        count: submissions.filter(s => s.createdAt?.toString().startsWith(date)).length
      }));

      // Top Facilitys
      const formCounts = {};
      submissions.forEach(s => {
        const name = s.formId?.formName || s.templateName || "Unknown";
        formCounts[name] = (formCounts[name] || 0) + 1;
      });
      const topFacilitys = Object.entries(formCounts).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);

      // Top Contributors
      const userCounts = {};
      submissions.forEach(s => {
        const name = s.submittedBy?.name || s.submittedBy || "Unknown";
        userCounts[name] = (userCounts[name] || 0) + 1;
      });
      const topContributors = Object.entries(userCounts).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);

      // Monthly Volume (Last 30 days)
      const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();
      const monthlyTrend = last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        count: submissions.filter(s => s.createdAt?.toString().startsWith(date)).length
      }));

      setChartData({
        statusDistribution: statusMap,
        plantDistribution: plantDist,
        submissionTrend: trend,
        topFacilitys,
        topContributors,
        monthlyVolume: monthlyTrend
      });
    };

  const handleExport = () => {
    if (allSubmissions.length === 0) return;
    const exportData = formatSubmissionsForExport(allSubmissions);
    exportToExcel(exportData, `company_submissions_report`, 'Submissions');
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await api.get("/api/subscription/status");
      setSubscription(res.data.data);
    } catch (err) {
      console.error("Failed to fetch subscription status");
    }
  };

  const getPlanIcon = (planName) => {
    switch(planName?.toUpperCase()) {
      case "SILVER": return "🥈";
      case "GOLD": return "🥇";
      case "PREMIUM": return "💎";
      default: return "📦";
    }
  };

  const getUsagePercentage = (current, limit) => {
    if (limit === "Unlimited") return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  // Enhanced stat cards with better visual hierarchy
  const statCards = [
    { 
      title: "Total Plants", 
      value: stats.totalPlants, 
      icon: <Factory className="w-7 h-7" />, 
      color: "emerald",
      subtitle: "Active facilities"
    },
    { 
      title: "Active Facilitys", 
      value: stats.totalFacilitys, 
      icon: <FileText className="w-7 h-7" />, 
      color: "indigo",
      subtitle: "Available templates"
    },
    { 
      title: "Submissions", 
      value: stats.totalSubmissions, 
      icon: <CheckCircle2 className="w-7 h-7" />, 
      color: "green",
      subtitle: "All time"
    },
    { 
      title: "Pending Review", 
      value: stats.pendingSubmissions, 
      icon: <AlertCircle className="w-7 h-7" />, 
      color: "amber",
      subtitle: "Awaiting action"
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Company Admin</h1>
          <p className="text-gray-500 font-medium mt-1">Overview of <span className="text-indigo-600 font-bold">{user?.companyName || "Your Company"}</span> manufacturing network</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-bold border border-gray-200 transition-all shadow-sm shadow-gray-100"
          >
            <Download className="w-5 h-5 text-indigo-600" />
            Export Analytics
          </button>
          <div className="flex items-center gap-4 border-l pl-6 border-gray-200 ml-3">
            {user?.companyLogo && (
              <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl p-1 shadow-sm hidden md:block overflow-hidden">
                <img src={user.companyLogo} alt={user.companyName} className="w-full h-full object-contain" />
              </div>
            )}
            <div className="text-right hidden md:block leading-tight">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Dashboard</p>
              <p className="text-xl font-black text-indigo-600 tracking-tighter uppercase italic line-clamp-1">{user?.companyName || "Your Company"}</p>
            </div>
          </div>
        </div>
      </div>

      {subscription && (
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 rounded-2xl p-6 shadow-2xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 relative z-10">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/20 transform group-hover:rotate-6 transition-transform duration-500">
                {getPlanIcon(subscription.plan?.id)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100">Enterprise Access</span>
                </div>
                <h2 className="text-3xl font-black tracking-tighter italic uppercase">{subscription.plan?.name} Plan</h2>
                <p className="text-indigo-100/80 font-medium text-sm mt-1">{subscription.plan?.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 lg:gap-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 min-w-[140px] shadow-sm">
                <div className="text-[10px] uppercase font-black tracking-widest text-indigo-200 mb-2">Plant Capacity</div>
                <div className="text-2xl font-black tracking-tighter flex items-baseline gap-1">
                  {subscription.usage?.plants}
                  <span className="text-xs font-bold opacity-50">/ {subscription.usage?.plantsLimit}</span>
                </div>
                {subscription.usage?.plantsLimit !== "Unlimited" && (
                  <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                    <div 
                      className="bg-white rounded-full h-1 shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                      style={{ width: `${getUsagePercentage(subscription.usage?.plants, subscription.usage?.plantsLimit)}%` }}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 min-w-[140px] shadow-sm">
                <div className="text-[10px] uppercase font-black tracking-widest text-indigo-200 mb-2">Approval Workflows</div>
                <div className="text-2xl font-black tracking-tighter">{subscription.limits?.approvalLevels}</div>
                <div className="text-[10px] font-bold text-indigo-200 mt-1 uppercase">Custom Levels</div>
              </div>

              <div className="bg-indigo-500/30 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-center items-center gap-2 border border-white/10 group/btn cursor-pointer transition-all hover:bg-white hover:text-indigo-600">
                <Phone className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest text-center">Upgrade Request</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards with Modern Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          statCards.map((card, i) => (
            <StatCard 
              key={i} 
              {...card}
              loading={loading}
            />
          ))
        )}
      </div>

      {/* Charts Grid with Improved Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">
          <LineChart 
            title="System Activity (7 Days)" 
            data={chartData.submissionTrend} 
          />
        </div>
        <div>
          <PieChart 
            title="Operational Health" 
            data={chartData.statusDistribution} 
          />
        </div>
        <div className="lg:col-span-3">
          <LineChart 
            title="Monthly Activity Volume" 
            data={chartData.monthlyVolume} 
          />
        </div>
        <div>
          <BarChart 
            title="Unit Distribution" 
            data={chartData.plantDistribution} 
            yLabel="Load"
          />
        </div>
        <div>
          <BarChart 
            title="Top Templates" 
            data={chartData.topFacilitys} 
            yLabel="Usage"
          />
        </div>
        <div>
          <BarChart 
            title="Top Contributors" 
            data={chartData.topContributors} 
            yLabel="Submissions"
          />
        </div>
      </div>

      {/* Recent Activity Section with Modern Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h2>
              <p className="text-xs text-gray-500 font-semibold mt-1.5 uppercase tracking-wider">Live stream from all units</p>
            </div>
            <Link to="/company/submissions" className="text-sm font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-5 py-2.5 rounded-xl transition-all hover:bg-indigo-100">
              Full Log
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Facility Template</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Origin Plant</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentSubmissions.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors shadow-sm"><FileText className="w-5 h-5 text-gray-400" /></div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight mb-1">{s.formId?.formName}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{s.submittedBy?.name || s.submittedBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Factory className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{s.plantId?.name || "Global Unit"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${
                        s.status?.toLowerCase() === 'approved' ? 'bg-green-50 text-green-600' : 
                        s.status?.toLowerCase() === 'submitted' ? 'bg-indigo-50 text-indigo-600' : 
                        s.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {s.status === 'submitted' ? 'pending' : s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentSubmissions.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                        <Activity className="w-12 h-12" />
                        <p className="text-sm font-black uppercase tracking-widest">No Recent Submissions</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      
        <div>
          <BarChart 
            title="Unit Distribution" 
            data={chartData.plantDistribution} 
            yLabel="Load"
            color="emerald"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Plant Performance & Limits</h2>
            <p className="text-gray-400 font-medium text-sm">Resource allocation monitoring across manufacturing units</p>
          </div>
          <TrendingUp className="w-8 h-8 text-indigo-600 opacity-20" />
        </div>
        
        {subscription?.plantUsage?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscription.plantUsage.map((plant) => (
              <div key={plant.plantId} className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-50/50">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-gray-900 uppercase tracking-tighter text-lg">{plant.plantName}</h3>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                    <Factory className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                      <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Facilitys Pool</span>
                      <span className="text-emerald-600">{plant.forms} <span className="text-gray-300">/ {plant.formsLimit}</span></span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-600 rounded-full h-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                        style={{ width: `${getUsagePercentage(plant.forms, plant.formsLimit)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Workforce</span>
                      <span className="text-purple-600">{plant.employees} <span className="text-gray-300">/ {plant.employeesLimit}</span></span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-purple-600 rounded-full h-full transition-all duration-1000 shadow-[0_0_10px_rgba(147,51,234,0.3)]" 
                        style={{ width: `${getUsagePercentage(plant.employees, plant.employeesLimit)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <Link to={`/company/plants/${plant.plantId}`} className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  Unit Insights <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
            <Factory className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-400 text-sm font-black uppercase tracking-widest text-center px-4">No plants registered in this network.</p>
          </div>
        )}
      </div>
    </div>
  );
}
