import { useEffect, useState } from "react";
import { analyticsApi } from "../../api/analytics.api";
import { FileText, TrendingUp, Clock, XCircle } from "lucide-react";
import LineChart from "../../components/analytics/LineChart";
import BarChart from "../../components/analytics/BarChart";
import PieChart from "../../components/analytics/PieChart";

export default function SuperAdminReports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadReports();
  }, [days]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getDashboardAnalytics(days);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">Comprehensive system analytics and insights</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
              <p className="text-gray-600 font-medium">Loading reports...</p>
            </div>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                    <p className="text-3xl font-bold text-gray-800">{analytics.pendingByStage?.total || 0}</p>
                  </div>
                  <FileText className="w-12 h-12 text-indigo-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-gray-800">{analytics.pendingByStage?.pending || 0}</p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-gray-800">{analytics.pendingByStage?.approved || 0}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-gray-800">{analytics.pendingByStage?.rejected || 0}</p>
                  </div>
                  <XCircle className="w-12 h-12 text-red-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                data={analytics.submissionsPerDay || []}
                title="Submissions Per Day"
                height={300}
              />
              <PieChart
                data={{
                  pending: analytics.pendingByStage?.pending || 0,
                  approved: analytics.pendingByStage?.approved || 0,
                  rejected: analytics.pendingByStage?.rejected || 0
                }}
                title="Status Distribution"
              />
            </div>

            {analytics.plantWiseStats && analytics.plantWiseStats.length > 0 && (
              <BarChart
                data={analytics.plantWiseStats.map(plant => ({
                  label: `${plant.plantName} (${plant.plantCode})`,
                  value: plant.stats.total
                }))}
                title="Plant-wise Statistics"
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No data available</h3>
          </div>
        )}
      </div>
    </div>
  );
}




