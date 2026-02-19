import { useState, useEffect } from "react";
import { Plus, Search, FileText, Trash2, Edit, Check, Archive, RefreshCw, Download, Loader2, Table } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { formApi } from "../../api/form.api";
import { useAuth } from "../../context/AuthContext";
import { templateApi } from "../../api/template.api";
import { submissionApi } from "../../api/submission.api";
import { exportToExcel, formatSubmissionsForExport, formatTemplateForExport } from "../../utils/excelExport";
import { logError } from "../../utils/errorHandler";
import { Modal } from "../../components/modals/Modal";
import { ActionBar } from "../../components/common/ActionBar";

export default function ArchivedFormsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForms, setSelectedForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormActionsModal, setShowFormActionsModal] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(null);

  const handleExportFormDetails = async (form) => {
    try {
      setExportingId(form._id);
      
      // Get form fields/sections
      const fields = form.sections?.flatMap(s => s.fields || []) || form.fields || [];
      
      // Create export data with Form ID and column values
      const exportData = [
        { Field: "Form ID", Value: form.numericalId ? `F-${form.numericalId.toString().padStart(3, '0')}` : (form.formId || form._id) },
        { Field: "Form Name", Value: form.formName },
        { Field: "Description", Value: form.description || "" },
        { Field: "Status", Value: form.status },
        { Field: "Created At", Value: formatDate(form.createdAt) },
        { Field: "", Value: "" },
        { Field: "FIELDS", Value: "" },
        ...fields.map((f, idx) => ({
          Field: `Field ${idx + 1}`,
          Value: `${f.label || f.fieldId} (${f.type})`
        }))
      ];
      
      const fileName = `${form.formName}_Details`;
      exportToExcel(exportData, fileName);
      setShowFormActionsModal(false);
      setSelectedForm(null);
    } catch (err) {
      logError("Export form details", err);
      toast.error("Failed to export form details");
    } finally {
      setExportingId(null);
    }
  };

  const handleExportTemplateDetails = (item) => {
    const data = formatTemplateForExport(item);
    const fileName = `${item.templateName || item.formName}_Details`;
    exportToExcel(data, fileName);
    setShowExportOptions(null);
  };

  const handleExportTemplateData = async (item) => {
    setExportingId(item._id);
    try {
      const res = await submissionApi.getSubmissions({ 
        templateId: item.isLegacy ? item._id : undefined,
        formId: !item.isLegacy ? item._id : undefined
      });
      
      const submissions = res.success ? res.data : (Array.isArray(res) ? res : []);
      
      if (submissions.length > 0) {
        const formattedData = formatSubmissionsForExport(submissions);
        const fileName = `${item.templateName || item.formName}_Submissions`;
        exportToExcel(formattedData, fileName);
      } else {
        toast.error("No submission data found for this template.");
      }
    } catch (err) {
      logError("Export template data", err);
      toast.error("Failed to export template data.");
    } finally {
      setExportingId(null);
      setShowExportOptions(null);
    }
  };

  const handleExportStats = async (item) => {
    setExportingId(item._id);
    try {
      const res = await submissionApi.getSubmissions({ 
        templateId: item.isLegacy ? item._id : undefined,
        formId: !item.isLegacy ? item._id : undefined
      });
      
      const submissions = res.success ? res.data : (Array.isArray(res) ? res : []);
      
      const total = submissions.length;
      const approved = submissions.filter(s => s.status?.toUpperCase() === "APPROVED").length;
      const rejected = submissions.filter(s => s.status?.toUpperCase() === "REJECTED").length;
      const pending = total - approved - rejected;

      const stats = [
        { Metric: "Total Submissions", Count: total },
        { Metric: "Approved", Count: approved },
        { Metric: "Rejected", Count: rejected },
        { Metric: "Pending", Count: pending },
        { Metric: "Approval Rate", Count: total > 0 ? `${((approved / total) * 100).toFixed(1)}%` : "0%" }
      ];

      const fileName = `${item.templateName || item.formName}_Stats`;
      exportToExcel(stats, fileName);
    } catch (err) {
      logError("Export stats", err);
      toast.error("Failed to export statistics.");
    } finally {
      setExportingId(null);
      setShowExportOptions(null);
    }
  };

  const handleBulkExport = async () => {
    if (selectedForms.length === 0) return;
    
    setExportingId("bulk");
    try {
      let allSubmissions = [];
      for (const id of selectedForms) {
        const item = allTemplates.find(t => t._id === id);
        if (!item) continue;
        
        const res = await submissionApi.getSubmissions({ 
          templateId: item.isLegacy ? item._id : undefined,
          formId: !item.isLegacy ? item._id : undefined
        });
        
        const submissions = res.success ? res.data : (Array.isArray(res) ? res : []);
        allSubmissions.push(...submissions);
      }
      
      if (allSubmissions.length > 0) {
        const formattedData = formatSubmissionsForExport(allSubmissions);
        exportToExcel(formattedData, `Bulk_Form_Export`);
      } else {
        toast.error("No submission data found for selected templates.");
      }
    } catch (err) {
      logError("Bulk export", err);
      toast.error("Failed to export data.");
    } finally {
      setExportingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, templatesRes] = await Promise.all([
        formApi.getForms(),
        templateApi.getTemplates()
      ]);
      
      if (formsRes.success) {
        setForms(formsRes.data);
      } else {
        setForms(formsRes || []);
      }

      if (templatesRes.success) {
        setTemplates(templatesRes.data);
      }
    } catch (err) {
      logError("Fetch forms data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFormSelection = (formId) => {
    setSelectedForms(prev => 
      prev.includes(formId) 
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const handleClearSelection = () => {
    setSelectedForms([]);
  };

  const handleDeleteTemplate = async (itemId) => {
    const item = [...templates, ...forms].find(f => f._id === itemId);
    const isForm = forms.some(f => f._id === itemId);
    
    const itemName = item?.templateName || item?.formName || 'this item';
    if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;
    
    try {
      if (isForm) {
        await formApi.deleteForm(itemId);
      } else {
        await templateApi.deleteTemplate(itemId);
      }
      fetchData();
    } catch (err) {
      logError(`Delete ${isForm ? 'form' : 'template'}`, err);
      const errorMessage = err.response?.data?.message || `Failed to delete ${isForm ? 'form' : 'template'}`;
      toast.error(errorMessage);
    }
  };

  const handleRestoreTemplate = async (itemId) => {
    const item = [...templates, ...forms].find(f => f._id === itemId);
    const isForm = forms.some(f => f._id === itemId);
    
    const itemName = item?.templateName || item?.formName || 'this item';
    if (!confirm(`Restore ${itemName}? It will become available for use again.`)) return;
    
    try {
      if (isForm) {
        await formApi.restoreForm(itemId);
      } else {
        await templateApi.restoreTemplate(itemId);
      }
      fetchData();
    } catch (err) {
      logError(`Restore ${isForm ? 'form' : 'template'}`, err);
      toast.error(`Failed to restore ${isForm ? 'form' : 'template'}`);
    }
  };

  // Separate regular forms from templates
  const regularForms = forms.filter(f => !f.isTemplate);
  const templateForms = forms.filter(f => f.isTemplate);
  const allTemplates = [
    ...templates.map(t => ({ ...t, isLegacy: true })),
    ...templateForms
  ];

  // Filter for archived forms only
  const filteredItems = [...regularForms.filter(f => f.status === "ARCHIVED"), 
                        ...templateForms.filter(t => t.status === "ARCHIVED")]
                      .filter(f => f.formName.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusBadge = (status) => {
    const s = status || "APPROVED";
    switch (s) {
      case "DRAFT":
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase">Draft</span>;
      case "IN_APPROVAL":
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">In Approval</span>;
      case "APPROVED":
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Approved</span>;
        case "REJECTED":
          return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">Rejected</span>;
        case "ARCHIVED":
          return <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-full uppercase">Archived</span>;
        default:
          return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">{s}</span>;
      }
    };

  return (
    <div className="space-y-3 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Archived Forms</h1>
          <p className="text-xs text-gray-500">Previously active forms that have been archived.</p>
        </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-slate-200/60 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search archived..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg border border-gray-100"></div>
          ))}
        </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-10">
                      <div 
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                          selectedForms.length === filteredItems.length && filteredItems.length > 0
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-gray-300 text-transparent'
                        }`}
                        onClick={() => {
                          if (selectedForms.length === filteredItems.length) {
                            setSelectedForms([]);
                          } else {
                            setSelectedForms(filteredItems.map(f => f._id));
                          }
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Form Name
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Form ID
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => {
                    const isSelected = selectedForms.includes(item._id);
                    const isArchived = item.status === "ARCHIVED";
                    const name = item.formName;
                    const fieldCount = (item.fields?.length || item.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0)) || 0;

                    return (
                      <tr 
                        key={item._id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/30' : ''} ${isArchived ? 'opacity-60 bg-gray-50/50' : ''}`}
                        onClick={() => {
                          if (!item.isTemplate && isArchived) {
                            toggleFormSelection(item._id);
                          }
                        }}
                      >
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div 
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                              isArchived ? 'bg-gray-200 border-gray-200 cursor-not-allowed' :
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                : 'bg-white border-gray-300 text-transparent'
                            }`}
                            onClick={() => !isArchived && toggleFormSelection(item._id)}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${isArchived ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-600'}`}>
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className={`font-semibold ${isArchived ? 'text-gray-500' : 'text-gray-900'}`}>{name}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</div>
                              )}
                              {isArchived && item.archivedAt && (
                                <div className="text-[10px] text-gray-400 mt-0.5 italic">
                                  Archived on {formatDate(item.archivedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <span 
                            className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 cursor-help"
                            title={`Raw ID: ${item.formId || item._id}${item.numericalId ? ` | Display: F-${item.numericalId.toString().padStart(3, '0')}` : ''}`}
                          >
                            {item.numericalId ? `F-${item.numericalId.toString().padStart(3, '0')}` : (item.formId || item._id)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-gray-400" />
                              {fieldCount} Fields
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span>{formatDate(item.createdAt).split(',')[0]}</span>
                            <span className="text-[9px] text-gray-400">{formatDate(item.createdAt).split(',')[1]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(item.status)}
                        </td>
                          <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {/* Restore button for archived forms */}
                              <button
                                onClick={() => handleRestoreTemplate(item._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Restore"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTemplate(item._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-gray-50/30">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <h3 className="text-gray-900 font-medium text-sm">
                No archived forms found
              </h3>
              <p className="text-gray-500 text-xs">
                No archived forms to display.
              </p>
            </div>
          )}
        </div>
      )}

      <ActionBar 
        selectedCount={selectedForms.length}
        onClear={handleClearSelection}
        onExport={handleBulkExport}
      />

      {showFormActionsModal && selectedForm && (
        <Modal 
          title={`Actions: ${selectedForm.formName}`}
          onClose={() => {
            setShowFormActionsModal(false);
            setSelectedForm(null);
          }}
        >
          <div className="space-y-3">
            <button
              onClick={() => handleExportFormDetails(selectedForm)}
              disabled={exportingId === selectedForm._id}
              className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors font-semibold disabled:opacity-50"
            >
              {exportingId === selectedForm._id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Export Form Details (Excel)
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}