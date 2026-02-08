import { useState, useEffect } from "react";
import { Building2, Factory, FileText, CheckCircle2, TrendingUp, Filter, Download, Plus, Settings, Users, Calendar, XCircle, Clock, Globe, ShieldCheck, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import BarChart from "../../components/analytics/BarChart";
import PieChart from "../../components/analytics/PieChart";
import LineChart from "../../components/analytics/LineChart";
import StatCard from "../../components/analytics/StatCard";
import CompanyAnalyticsTable from "../../components/analytics/CompanyAnalyticsTable";
import { exportToExcel, formatSubmissionsForExport } from "../../utils/excelExport";

function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
      <div className="space-y-2.5">
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-7 w-14 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedRange, setSelectedRange] = useState("30");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCompany, selectedPlant, selectedRange]);

  const fetchInitialData = async () => {
    try {
      const [companiesRes, plantsRes] = await Promise.all([
        api.get("/api/companies"),
        api.get("/api/plants")
      ]);
      setCompanies(companiesRes.data.data || companiesRes.data);
      setPlants(plantsRes.data.data || plantsRes.data);
    } catch (err) {
      console.error("Failed to fetch initial data", err);
      console.error("Companies API error:", err.response || err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    const params = {
      days: selectedRange,
      companyId: selectedCompany || undefined,
      plantId: selectedPlant || undefined
    };
    try {
      const response = await api.get("/api/analytics/super-admin", { params });
      setAnalytics(response.data.data);
    } catch (err) {
      console.error("Failed to fetch super admin analytics", err);
      console.error("Error details:", err.response || err.message || err);
      console.error("Request params:", params);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleExport = () => {
    if (!analytics?.companyTable) return;
    const exportData = analytics.companyTable.map(row => ({
      'Company Name': row.companyName,
      'Plants': row.plantsCount,
      'Forms': row.formsCount,
      'Submissions': row.submissionsCount,
      'Approved %': row.approvedPercent,
      'Rejected %': row.rejectedPercent,
      'Pending %': row.pendingPercent
    }));
    exportToExcel(exportData, `system_analytics`, 'Analytics');
  };

  const handleExportSubmissions = async () => {
    try {
      const params = {
        companyId: selectedCompany || undefined,
        plantId: selectedPlant || undefined
      };
      const response = await api.get("/api/submissions", { params });
      if (response.data.success) {
        const exportData = formatSubmissionsForExport(response.data.data);
        exportToExcel(exportData, `all_submissions_report`, 'Submissions');
      }
    } catch (err) {
      console.error("Failed to export submissions", err);
    }
  };

  const filteredPlants = selectedCompany 
    ? plants.filter(p => p.companyId === selectedCompany)
    : [];

  const kpis = analytics?.kpi || {};
  const statCardsData = [
    { title: "Network Companies", value: kpis.totalCompanies || 0, icon: <Building2 className="w-7 h-7" />, color: "blue" },
    { title: "Facility Count", value: kpis.totalPlants || 0, icon: <Factory className="w-7 h-7" />, color: "indigo" },
    { title: "Total Templates", value: kpis.totalForms || 0, icon: <FileText className="w-7 h-7" />, color: "purple" },
    { title: "System Throughput", value: kpis.totalSubmissions || 0, icon: <Activity className="w-7 h-7" />, color: "indigo" },
    { title: "Successful Permits", value: kpis.totalApproved || 0, icon: <CheckCircle2 className="w-7 h-7" />, color: "green" },
    { title: "Blocked Permits", value: kpis.totalRejected || 0, icon: <XCircle className="w-7 h-7" />, color: "red" },
    { title: "Live Operators", value: kpis.activeUsersToday || 0, icon: <Users className="w-7 h-7" />, color: "amber" },
    { title: "Avg Cycle Time", value: `${kpis.averageApprovalTime || 0}d`, icon: <Clock className="w-7 h-7" />, color: "orange" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        {loading && (
          <div className="text-center py-4">
            <p>Loading dashboard...</p>
          </div>
        )}
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100">System Master</div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Monitoring</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">System Analytics</h1>
            <p className="text-gray-500 font-medium mt-2 text-sm">Global infrastructure oversight and resource optimization.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
              <div className="flex items-center px-3 border-r border-gray-200">
                <Globe className="w-3.5 h-3.5 text-indigo-500 mr-2" />
                <select
                  value={selectedCompany}
                  onChange={(e) => { setSelectedCompany(e.target.value); setSelectedPlant(""); }}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-gray-700 pr-8 appearance-none cursor-pointer"
                >
                  <option value="">All Companies</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex items-center px-3 border-r border-gray-200">
                <Calendar className="w-3.5 h-3.5 text-purple-500 mr-2" />
                <select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-gray-700 pr-8 appearance-none cursor-pointer"
                >
                  <option value="1">Today</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>

              <button 
                onClick={handleExportSubmissions}
                className="flex items-center gap-2 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-sm border border-indigo-100"
              >
                <Download className="w-3 h-3" />
                Submissions
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(analyticsLoading || loading) ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />) : statCardsData.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${analyticsLoading ? "opacity-50" : ""} transition-opacity`}>
          <LineChart 
            title="Operational Velocity" 
            data={analytics?.charts?.submissionsOverTime || []} 
          />
        </div>

        <div className={`${analyticsLoading ? "opacity-50" : ""} transition-opacity`}>
          <PieChart 
            title="Governance Status" 
            data={analytics?.charts?.statusBreakdown?.reduce((acc, curr) => ({ ...acc, [curr.name.toLowerCase()]: curr.value }), {}) || null} 
          />
        </div>

        <div className={`${analyticsLoading ? "opacity-50" : ""} transition-opacity`}>
          <BarChart 
            title="Template Saturation" 
            data={analytics?.charts?.companyUsage?.map(c => ({ label: c.name, value: c.forms })) || []} 
            yLabel="Templates"
          />
        </div>

        <div className={`${analyticsLoading ? "opacity-50" : ""} transition-opacity`}>
          <BarChart 
            title="Activity Load" 
            data={analytics?.charts?.companyUsage?.map(c => ({ label: c.name, value: c.submissions })) || []} 
            yLabel="Records"
          />
        </div>

        <div className={`${analyticsLoading ? "opacity-50" : ""} transition-opacity`}>
          <BarChart 
            title="Approval Efficiency" 
            data={analytics?.companyTable?.map(c => ({ label: c.companyName, value: parseFloat(c.approvedPercent) })) || []} 
            yLabel="Approval %"
          />
        </div>

        <div className={`${analyticsLoading ? "opacity-50" : ""} transition-opacity`}>
          <BarChart 
            title="Blocked Rate" 
            data={analytics?.companyTable?.map(c => ({ label: c.companyName, value: parseFloat(c.rejectedPercent) })) || []} 
            yLabel="Rejected %"
          />
        </div>
      </div>

      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${analyticsLoading ? "opacity-50" : ""} transition-opacity`}>
        <CompanyAnalyticsTable 
          data={analytics?.companyTable || []} 
          onExport={handleExport} 
        />
      </div>

      <div className="bg-indigo-900 p-8 lg:p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-20" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Infrastructure Control</h2>
              <p className="text-indigo-200/80 font-medium text-sm mt-1">Direct access to critical system management modules.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { to: "/super/companies", title: "Global Clients", desc: "Enterprise accounts.", icon: Building2, color: "text-blue-200", bg: "bg-blue-500/20" },
              { to: "/super/users", title: "Access Control", desc: "Privileged accounts.", icon: Users, color: "text-purple-200", bg: "bg-purple-500/20" },
              { to: "/super/plants", title: "Facility Map", desc: "Global asset registry.", icon: Factory, color: "text-indigo-200", bg: "bg-indigo-500/20" },
              { onClick: handleExport, title: "Data Snapshot", desc: "System-wide metrics.", icon: Download, color: "text-emerald-200", bg: "bg-emerald-500/20" },
            ].map((item, i) => (
              item.to ? (
                <Link key={i} to={item.to} className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white hover:text-indigo-900 transition-all group shadow-sm">
                  <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center transition-colors group-hover:bg-indigo-50 shadow-inner`}>
                    <item.icon className={`w-6 h-6 ${item.color} group-hover:text-indigo-600 transition-colors`} />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-tighter text-lg">{item.title}</p>
                    <p className="text-[10px] font-bold opacity-60 mt-0.5 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </Link>
              ) : (
                <button key={i} onClick={item.onClick} className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white hover:text-indigo-900 transition-all group text-left shadow-sm">
                  <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center transition-colors group-hover:bg-indigo-50 shadow-inner`}>
                    <item.icon className={`w-6 h-6 ${item.color} group-hover:text-indigo-600 transition-colors`} />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-tighter text-lg">{item.title}</p>
                    <p className="text-[10px] font-bold opacity-60 mt-0.5 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </button>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
