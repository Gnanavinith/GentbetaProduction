import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { formApi } from "../../api/form.api";
import { SkeletonTable } from "../../components/common/Skeleton";
import { 
  Plus, 
  FileText,
  Search,
  Hash
} from "lucide-react";

export default function EmployeeTemplates() {
  const navigate = useNavigate();
  const location = useLocation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when coming back from form filling
  useEffect(() => {
    if (location.state?.shouldRefresh) {
      fetchData();
      // Clear the refresh flag
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const formsRes = await formApi.getFacilitys();

      if (formsRes.success) {
        // Add field count calculation to each template (count only top-level fields)
        const templatesWithFieldCount = formsRes.data.map(template => {
          const topLevelFields = template.fields?.length || 0;
          // Only count top-level fields, not section fields
          const totalFields = topLevelFields;
          
          return {
            ...template,
            fieldCount: totalFields
          };
        });
        setTemplates(templatesWithFieldCount);
      } else {
        toast.error(formsRes.message || "Failed to fetch templates");
      }
    } catch (error) {
      toast.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.numericalId ? `F-${t.numericalId.toString().padStart(3, '0')}` : (t.formId || t._id || "")).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (templateId) => {
    navigate(`/employee/fill-template/${templateId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-64 animate-pulse" />
          </div>
          <div className="h-10 bg-gray-100 rounded-xl w-64 animate-pulse" />
        </div>
        <SkeletonTable rows={5} columns={5} className="bg-white rounded-2xl border border-gray-100 shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility</h1>
          <p className="text-gray-500 text-sm">Select a facility to fill and submit for approval.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full md:w-64 text-sm"
          />
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No templates found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? "Try adjusting your search" : "No templates are available at the moment"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Facility Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Facility ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Top-level Fields</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval Levels</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Created At</th>
                </tr>
              </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredTemplates.map((template) => (
                        <tr 
                          key={template._id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleRowClick(template._id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {template.formName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span 
                              className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 cursor-help"
                              title={`Raw ID: ${template._id}${template.formId ? ` | Facility Code: ${template.formId}` : ''}${template.numericalId ? ` | Display: F-${template.numericalId.toString().padStart(3, '0')}` : ''}`}
                            >
                              {template.numericalId ? `F-${template.numericalId.toString().padStart(3, '0')}` : (template.formId || template._id || "—")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-gray-400" />
                              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                {template.fieldCount || 0} top-level
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {template.approvalLevels?.length || template.approvalFlow?.length || 1} Levels
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {template.createdAt ? new Date(template.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : "—"}
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}