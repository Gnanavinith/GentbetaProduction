import { useState } from "react";
import { Search, ChevronUp, ChevronDown, Download, Building2 } from "lucide-react";

export default function CompanyAnalyticsTable({ data, onExport }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "companyName", direction: "asc" });

  const sortedData = [...data].filter(item => 
    item.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <div className="w-4 h-4" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Company Performance</h2>
          <p className="text-sm text-gray-500">Breakdown of usage across all organizations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-64 transition-all"
            />
          </div>
          <button
            onClick={onExport}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
            title="Export to CSV"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: "Company", key: "companyName" },
                { label: "Plants", key: "plantsCount" },
                { label: "Forms", key: "formsCount" },
                { label: "Submissions", key: "submissionsCount" },
                { label: "Approved %", key: "approvedPercent" },
                { label: "Rejected %", key: "rejectedPercent" },
                { label: "Pending %", key: "pendingPercent" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => requestSort(col.key)}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    <SortIcon column={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.length > 0 ? (
              sortedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-gray-900">{row.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{row.plantsCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{row.formsCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{row.submissionsCount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold">
                      {row.approvedPercent}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold">
                      {row.rejectedPercent}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">
                      {row.pendingPercent}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">
                  No matching companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
