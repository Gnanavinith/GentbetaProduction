import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  ClipboardList,
  ChevronRight,
  Clock,
  User,
  Users,
  X,
  Eye,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock3,
  ArrowRight,
  Inbox,
  Table,
  Check,
  Loader2
} from "lucide-react";
import { formApi } from "../api/form.api";
import { submissionApi } from "../api/submission.api";
import { templateApi } from "../api/template.api";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { exportToExcel } from "../utils/excelExport";
import { exportTableToPDF } from "../utils/exportUtils";
import { toast } from "react-hot-toast";
import { Copy } from "lucide-react";

export default function FormsCardView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForm, setSelectedForm] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "submissions"
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedForms, setSelectedForms] = useState([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(null);
  const [exportingId, setExportingId] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);



  const fetchData = async () => {
    try {
      setLoading(true);
      const [formsRes, submissionsRes] = await Promise.all([
        formApi.getForms(),
        submissionApi.getSubmissions()
      ]);

      if (formsRes.success) {
        // Filter out draft forms from the forms list
        const nonDraftForms = (formsRes.data || []).filter(form => form.status && form.status.toUpperCase() !== "DRAFT");
        setForms(nonDraftForms);
      }
      if (submissionsRes.success) {
        setSubmissions(submissionsRes.data || []);
      } else {
        setSubmissions(submissionsRes || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const getFormSubmissionCount = (formId) => {
    return submissions.filter(s =>
      (s.formId?._id === formId || s.formId === formId) ||
      (s.templateId?._id === formId || s.templateId === formId)
    ).length;
  };

  const getLatestSubmissionDate = (formId) => {
    const formSubmissions = submissions.filter(s =>
      (s.formId?._id === formId || s.formId === formId) ||
      (s.templateId?._id === formId || s.templateId === formId)
    );
    if (formSubmissions.length === 0) return null;
    const dates = formSubmissions.map(s => new Date(s.createdAt));
    return new Date(Math.max(...dates));
  };

  const handleFormClick = (form) => {
    setSelectedForm(form);
    setViewMode("submissions");
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const filteredForms = forms.filter(f =>
    (f.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    f.status && f.status.toUpperCase() !== "DRAFT"
  );

  const filteredSubmissions = submissions.filter(s =>
    (s.formId?._id === selectedForm?._id || s.formId === selectedForm?._id) ||
    (s.templateId?._id === selectedForm?._id || s.templateId === selectedForm?._id)
  );

  const getFormFields = (form) => {
    if (!form) return [];
    
    let allFields = [...(form.fields || [])];
    
    if (form.sections) {
      form.sections.forEach(section => {
        if (section.fields) {
          allFields = [...allFields, ...section.fields];
        }
      });
    }
    
    // Filter out non-data fields and remove duplicates
    const uniqueFields = [];
    const seenIds = new Set();
    
    allFields.forEach(field => {
      const fieldId = field.fieldId || field.id;
      if (fieldId && !seenIds.has(fieldId) && 
          !["section-divider", "section-header", "spacer", "columns-2", "columns-3"].includes(field.type)) {
        seenIds.add(fieldId);
        uniqueFields.push(field);
      }
    });
    
    return uniqueFields;
  };

  const getApproversCount = (submission) => {
    const approvalFlow = selectedForm?.approvalFlow || [];
    const approvalHistory = submission?.approvalHistory || [];
    const totalApprovers = approvalFlow.length;
    const approvedCount = approvalHistory.filter(h => h.status === "APPROVED").length;
    return { approved: approvedCount, total: totalApprovers };
  };

  const getApproverDetails = (submission) => {
    const approvalFlow = selectedForm?.approvalFlow || [];
    const approvalHistory = submission?.approvalHistory || [];

    return approvalFlow.map(approver => {
      const history = approvalHistory.find(h =>
        h.approverId === approver.approverId ||
        h.approverId?._id === approver.approverId ||
        h.level === approver.level
      );
      return {
        level: approver.level,
        name: approver.name || `Approver ${approver.level}`,
        approverId: approver.approverId,
        status: history?.status || "PENDING",
        comments: history?.comments,
        actionedAt: history?.actionedAt
      };
    });
  };

  const isImageUrl = (value) => {
    if (!value || typeof value !== 'string') return false;
    return value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ||
      value.includes('cloudinary.com') ||
      value.includes('res.cloudinary.com') ||
      value.startsWith('data:image');
  };

  const getSubmissionData = (submission) => {
    if (!submission?.data) return {};
    try {
      return typeof submission.data === 'string' ? JSON.parse(submission.data) : submission.data;
    } catch {
      return {};
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "APPROVED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      case "SUBMITTED": return "bg-blue-100 text-blue-700";
      case "PENDING_APPROVAL":
      case "IN_PROGRESS": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const toggleFormSelection = (formId) => {
    setSelectedForms(prev =>
      prev.includes(formId)
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const toggleSubmissionSelection = (subId) => {
    setSelectedSubmissions(prev =>
      prev.includes(subId)
        ? prev.filter(id => id !== subId)
        : [...prev, subId]
    );
  };

  const handleExportFormSummary = async (form) => {
    setExportingId(form._id);
    try {
      const formSubmissions = submissions.filter(s =>
        (s.formId?._id === form._id || s.formId === form._id) ||
        (s.templateId?._id === form._id || s.templateId === form._id)
      );

      const total = formSubmissions.length;
      const approved = formSubmissions.filter(s => s.status?.toUpperCase() === "APPROVED").length;
      const rejected = formSubmissions.filter(s => s.status?.toUpperCase() === "REJECTED").length;
      const pending = total - approved - rejected;

      const approvalFlow = form.approvalFlow || [];
      const approverLevels = approvalFlow.map((a, i) => ({
        Level: a.level || i + 1,
        'Approver Name': a.approverId?.name || a.name || `Approver ${i + 1}`,
        'Approved Count': formSubmissions.filter(s =>
          s.approvalHistory?.some(h => h.level === (a.level || i + 1) && h.status === "APPROVED")
        ).length
      }));

      
      const summaryData = [
        { Metric: 'Form ID', Value: form._id },
        { Metric: 'Facility Name', Value: form.formName },
        { Metric: 'Created Date', Value: new Date(form.createdAt).toLocaleString() },
        { Metric: 'Total Submissions', Value: total },
        { Metric: 'Approved', Value: approved },
        { Metric: 'Rejected', Value: rejected },
        { Metric: 'Pending', Value: pending },
        { Metric: 'Approval Rate', Value: total > 0 ? `${((approved / total) * 100).toFixed(1)}%` : '0%' },
        { Metric: '', Value: '' },
        { Metric: 'APPROVER LEVELS', Value: '' },
        ...approverLevels.map(a => ({ Metric: `Level ${a.Level} - ${a['Approver Name']}`, Value: `${a['Approved Count']} approved` }))
      ];

      const fileName = `${form.formName}_Summary`;
      await exportToExcel(summaryData, fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingId(null);
      setShowExportMenu(null);
    }
  };



  const handleExportFormData = async (form) => {
    setExportingId(form._id);
    try {
      const formSubmissions = submissions.filter(s =>
        (s.formId?._id === form._id || s.formId === form._id) ||
        (s.templateId?._id === form._id || s.templateId === form._id)
      );

      if (formSubmissions.length === 0) {
        alert('No submission data found for this form.');
        return;
      }

      const fields = getFormFields(form);
      const exportData = formSubmissions.map(s => {
        const data = getSubmissionData(s);
        const approvalFlow = form.approvalFlow || [];
        const approvalHistory = s.approvalHistory || [];

        const row = {
          'Submission ID': s.readableId || s._id,
          'Submitted By': typeof s.submittedBy === 'object' ? s.submittedBy?.name : s.submittedBy || 'Unknown',
          'Submitted Date': new Date(s.createdAt).toLocaleString(),
          'Status': s.status?.replace(/_/g, ' ')
        };

        fields.forEach(f => {
          row[f.label] = data[f.fieldId] || '-';
        });

        approvalFlow.forEach((a, i) => {
          const history = approvalHistory.find(h => h.level === (a.level || i + 1));
          row[`Level ${a.level || i + 1} Approver`] = a.approverId?.name || a.name || `Approver ${i + 1}`;
          row[`Level ${a.level || i + 1} Status`] = history?.status || 'PENDING';
          row[`Level ${a.level || i + 1} Date`] = history?.actionedAt ? new Date(history.actionedAt).toLocaleString() : '-';
        });

        return row;
      });

      const fileName = `${form.formName}_Data`;
      await exportToExcel(exportData, fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingId(null);
      setShowExportMenu(null);
    }
  };

  const handleExportSingleSubmission = async (submission) => {
    setExportingId(submission._id);
    try {
      const fields = getFormFields(selectedForm);
      const data = getSubmissionData(submission);
      const approvalFlow = selectedForm?.approvalFlow || [];
      const approvalHistory = submission.approvalHistory || [];

      const exportData = [
        { Field: 'Submission ID', Value: submission.readableId || submission._id },
        { Field: 'Submitted By', Value: typeof submission.submittedBy === 'object' ? submission.submittedBy?.name : submission.submittedBy || 'Unknown' },
        { Field: 'Submitted Date', Value: new Date(submission.createdAt).toLocaleString() },
        { Field: 'Status', Value: submission.status?.replace(/_/g, ' ') },
        { Field: '', Value: '' },
        { Field: 'FORM DATA', Value: '' },
        ...fields.map(f => ({ Field: f.label, Value: data[f.fieldId] || '-' })),
        { Field: '', Value: '' },
        { Field: 'APPROVAL HISTORY', Value: '' },
        ...approvalFlow.map((a, i) => {
          const history = approvalHistory.find(h => h.level === (a.level || i + 1));
          return {
            Field: `Level ${a.level || i + 1} - ${a.approverId?.name || a.name || `Approver ${i + 1}`}`,
            Value: `${history?.status || 'PENDING'}${history?.actionedAt ? ` (${new Date(history.actionedAt).toLocaleString()})` : ''}`
          };
        })
      ];

      const fileName = `Submission_${(submission.readableId || submission._id).slice(-6)}`;
      await exportToExcel(exportData, fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingId(null);
      setShowExportMenu(null);
    }
  };

  const handleBulkExportForms = async () => {
    if (selectedForms.length === 0) return;
    setExportingId('bulk-forms');
    try {
      const allData = [];
      for (const formId of selectedForms) {
        const form = forms.find(f => f._id === formId);
        if (!form) continue;

        const formSubmissions = submissions.filter(s =>
          (s.formId?._id === form._id || s.formId === form._id) ||
          (s.templateId?._id === form._id || s.templateId === form._id)
        );

        const total = formSubmissions.length;
        const approved = formSubmissions.filter(s => s.status?.toUpperCase() === "APPROVED").length;
        const rejected = formSubmissions.filter(s => s.status?.toUpperCase() === "REJECTED").length;
        const pending = total - approved - rejected;

        allData.push({
          'Form ID': form._id,
          'Facility Name': form.formName,
          'Created Date': new Date(form.createdAt).toLocaleString(),
          'Total Submissions': total,
          'Approved': approved,
          'Rejected': rejected,
          'Pending': pending,
          'Approval Rate': total > 0 ? `${((approved / total) * 100).toFixed(1)}%` : '0%',
          'Approvers': (form.approvalFlow || []).map(a => a.approverId?.name || a.name || 'Unknown').join(', ')
        });
      }

      await exportToExcel(allData, 'Bulk_Forms_Summary');
    } catch (err) {
      console.error('Bulk export failed:', err);
    } finally {
      setExportingId(null);
    }
  };

  const handleBulkExportSubmissions = async () => {
    if (selectedSubmissions.length === 0) return;
    setExportingId('bulk-submissions');
    try {
      const fields = getFormFields(selectedForm);
      const approvalFlow = selectedForm?.approvalFlow || [];

      const exportData = selectedSubmissions.map(subId => {
        const s = filteredSubmissions.find(sub => sub._id === subId);
        if (!s) return null;

        const data = getSubmissionData(s);
        const approvalHistory = s.approvalHistory || [];

        const row = {
          'Submission ID': s.readableId || s._id,
          'Submitted By': typeof s.submittedBy === 'object' ? s.submittedBy?.name : s.submittedBy || 'Unknown',
          'Submitted Date': new Date(s.createdAt).toLocaleString(),
          'Status': s.status?.replace(/_/g, ' ')
        };

        fields.forEach(f => {
          row[f.label] = data[f.fieldId] || '-';
        });

        approvalFlow.forEach((a, i) => {
          const history = approvalHistory.find(h => h.level === (a.level || i + 1));
          row[`Level ${a.level || i + 1} Status`] = history?.status || 'PENDING';
        });

        return row;
      }).filter(Boolean);

      await exportToExcel(exportData, `${selectedForm?.formName}_Bulk_Submissions`);
    } catch (err) {
      console.error('Bulk export failed:', err);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {viewMode === "submissions" ? `Submissions: ${selectedForm?.formName}` : "Form Templates"}
          </h1>
          <p className="text-[15px] text-gray-500">
            {viewMode === "submissions"
              ? "Review data collected from this form template."
              : "Browse and view data for all available form templates."}
          </p>
        </div>

        {viewMode === "submissions" && (
          <button
            onClick={() => setViewMode("table")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Templates
          </button>
        )}
      </div>

      {/* Stats Cards (Optional but adds value) */}
      {viewMode === "table" && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Templates', value: forms.filter(f => f.status && f.status.toUpperCase() !== "DRAFT").length, sub: 'Available forms', icon: FileText },
            { label: 'Active Submissions', value: submissions.length, sub: 'Across all forms', icon: ClipboardList },
            { label: 'Latest Submission', value: formatDate(Math.max(...submissions.map(s => new Date(s.createdAt)))), sub: 'Most recent activity', icon: Clock },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-gray-500">{stat.label}</p>
                <stat.icon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-[11px] text-gray-400">{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls & Table Container */}
      <div className="space-y-4">
        {viewMode === "table" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates by name or description..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50/50 sticky top-0 z-10">
                {viewMode === "table" ? (
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 w-10">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${selectedForms.length === filteredForms.length && filteredForms.length > 0
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-300 text-transparent'
                          }`}
                        onClick={() => {
                          if (selectedForms.length === filteredForms.length) {
                            setSelectedForms([]);
                          } else {
                            setSelectedForms(filteredForms.map(f => f._id));
                          }
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Form Template
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Latest Activity
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Actions
                    </th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 w-10">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-300 text-transparent'
                          }`}
                        onClick={() => {
                          if (selectedSubmissions.length === filteredSubmissions.length) {
                            setSelectedSubmissions([]);
                          } else {
                            setSelectedSubmissions(filteredSubmissions.map(s => s._id));
                          }
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Submitted By</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Date & Time</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Approvers</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                    <th className="px-6 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 w-5 bg-gray-100 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48 mb-2"></div><div className="h-3 bg-gray-50 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12 ml-auto"></div></td>
                    </tr>
                  ))
                ) : viewMode === "table" ? (
                  filteredForms.length > 0 ? (
                    filteredForms.map((form) => {
                      const isSelected = selectedForms.includes(form._id);
                      return (
                        <tr
                          key={form._id}
                          className={`group hover:bg-gray-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/30' : ''}`}
                        >
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-white border-gray-300 text-transparent'
                                }`}
                              onClick={() => toggleFormSelection(form._id)}
                            >
                              <Check className="w-3 h-3" />
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[280px]" onClick={() => handleFormClick(form)}>
                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-2 bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 rounded-md transition-colors">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                  {form.formName}
                                </div>
                                <div className="text-[12px] text-gray-500 leading-tight mt-0.5 line-clamp-1">
                                  {form.description || 'No description provided for this form.'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleFormClick(form)}>
                            <span className="text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                              {getFormSubmissionCount(form._id)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleFormClick(form)}>
                            <div className="flex flex-col">
                              <span className="text-[13px] text-gray-900 font-medium">{formatDate(getLatestSubmissionDate(form._id))}</span>
                              <span className="text-[11px] text-gray-400">Last submission</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <div className="relative">
                                <button
                                  onClick={() => setShowExportMenu(showExportMenu === form._id ? null : form._id)}
                                  disabled={exportingId === form._id}
                                  className={`p-2 rounded-lg transition-colors ${showExportMenu === form._id ? 'bg-indigo-100 text-indigo-700' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                  title="Export Options"
                                >
                                  {exportingId === form._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>

                                {showExportMenu === form._id && (
                                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden text-left p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Summary Report</div>
                                    <button onClick={() => handleExportFormSummary(form)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                      <Table className="w-3.5 h-3.5 text-green-600" /> Excel Format
                                    </button>

                                    <div className="h-px bg-gray-100 my-1" />
                                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">All Submissions Data</div>
                                    <button onClick={() => handleExportFormData(form)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                      <Table className="w-3.5 h-3.5 text-green-600" /> Excel Format
                                    </button>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleFormClick(form)}
                                className="inline-flex items-center text-[13px] font-semibold text-gray-400 hover:text-indigo-600 transition-colors"
                              >
                                View Data <ArrowRight className="w-3.5 h-3.5 ml-1" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Inbox className="w-10 h-10 text-gray-200 mb-2" />
                          <p className="text-sm">No forms found matching your search.</p>
                        </div>
                      </td>
                    </tr>
                  )
                ) : (
                  filteredSubmissions.map((s) => {
                    const approversCount = getApproversCount(s);
                    const isSelected = selectedSubmissions.includes(s._id);
                    return (
                      <tr key={s._id} className={`hover:bg-gray-50 transition-colors group ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-gray-300 text-transparent'
                              }`}
                            onClick={() => toggleSubmissionSelection(s._id)}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {typeof s.submittedBy === 'object' ? s.submittedBy?.name : s.submittedBy || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[13px] text-gray-900 font-medium">{new Date(s.createdAt).toLocaleDateString()}</span>
                            <span className="text-[11px] text-gray-400">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                              {Array.from({ length: Math.min(approversCount.total, 3) }).map((_, i) => (
                                <div key={i} className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] font-bold ${i < approversCount.approved ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                            <span className="text-[12px] font-medium text-gray-500">
                              {approversCount.approved}/{approversCount.total}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(s.status)} border-current bg-opacity-10`}>
                            {s.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <div className="relative">
                              <button
                                onClick={() => setShowExportMenu(showExportMenu === s._id ? null : s._id)}
                                disabled={exportingId === s._id}
                                className={`p-1.5 rounded-md transition-colors ${showExportMenu === s._id ? 'bg-indigo-50 text-indigo-600' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                title="Export"
                              >
                                {exportingId === s._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>

                              {showExportMenu === s._id && (
                                <div className="absolute right-8 -mt-9 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] flex items-center gap-1 p-1 animate-in fade-in slide-in-from-top-2 duration-200">

                                  <button
                                    onClick={() => handleExportSingleSubmission(s, 'excel')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                  >
                                    <Table className="w-4 h-4 text-green-600" />
                                    Excel
                                  </button>

                                  {/* <button
                                    onClick={() => handleExportSingleSubmission(s, 'pdf')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                  >
                                    <FileText className="w-4 h-4 text-red-600" />
                                    PDF
                                  </button> */}

                                </div>

                              )}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/${user.role.toLowerCase().replace('_admin', '')}/submissions/${s._id}`); }}
                              className="p-1.5 hover:bg-indigo-50 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Quick View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                {!loading && viewMode === "submissions" && filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <ClipboardList className="w-10 h-10 text-gray-200 mb-2" />
                        <h3 className="text-sm font-medium">No submissions yet</h3>
                        <p className="text-xs">Data will appear here once this form is filled out.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {viewMode === "table" && selectedForms.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-sm font-medium">{selectedForms.length} form(s) selected</span>
          <div className="h-5 w-px bg-gray-700" />
          <button
            onClick={() => handleBulkExportForms('excel')}
            disabled={exportingId === 'bulk-forms'}
            className="flex items-center gap-2 text-sm font-semibold hover:text-emerald-400 transition-colors"
          >
            {exportingId === 'bulk-forms' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />}
            Export Excel
          </button>
          <button
            onClick={() => handleBulkExportForms('pdf')}
            disabled={exportingId === 'bulk-forms'}
            className="flex items-center gap-2 text-sm font-semibold hover:text-red-400 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <div className="h-5 w-px bg-gray-700" />
          <button
            onClick={() => setSelectedForms([])}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {viewMode === "submissions" && selectedSubmissions.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-sm font-medium">{selectedSubmissions.length} submission(s) selected</span>
          <div className="h-5 w-px bg-gray-700" />
          <button
            onClick={() => handleBulkExportSubmissions('excel')}
            disabled={exportingId === 'bulk-submissions'}
            className="flex items-center gap-2 text-sm font-semibold hover:text-emerald-400 transition-colors"
          >
            {exportingId === 'bulk-submissions' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />}
            Export Excel
          </button>
          <button
            onClick={() => handleBulkExportSubmissions('pdf')}
            disabled={exportingId === 'bulk-submissions'}
            className="flex items-center gap-2 text-sm font-semibold hover:text-red-400 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <div className="h-5 w-px bg-gray-700" />
          <button
            onClick={() => setSelectedSubmissions([])}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedForm?.formName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Submission Detail</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] space-y-6">
              {/* Submission Meta */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Submitted By</p>
                  <p className="text-sm font-bold text-gray-900">{typeof selectedSubmission.submittedBy === 'object' ? selectedSubmission.submittedBy?.name : 'Unknown'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Data Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFormFields(selectedForm).map((field) => {
                  const data = getSubmissionData(selectedSubmission);
                  const value = data[field.fieldId];

                  return (
                    <div key={field.fieldId} className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{field.label}</label>
                      <div className="p-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-900 font-medium shadow-sm">
                        {field.type === 'signature' || isImageUrl(value) ? (
                          <div
                            onClick={() => setPreviewImage(value)}
                            className="cursor-pointer group relative inline-block"
                          >
                            <img
                              src={value}
                              alt={field.label}
                              className="max-h-20 rounded border border-gray-100 hover:border-indigo-300 transition-colors"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : field.type === 'file' ? (
                          <div className="flex items-center gap-2 text-indigo-600">
                            <Download className="w-4 h-4" />
                            <span>Download File</span>
                          </div>
                        ) : value || '-'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Approvers Section */}
              {getApproverDetails(selectedSubmission).length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Approval Workflow
                  </h3>
                  <div className="space-y-3">
                    {getApproverDetails(selectedSubmission).map((approver, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl border ${approver.status === 'APPROVED' ? 'bg-green-50/50 border-green-100' :
                          approver.status === 'REJECTED' ? 'bg-red-50/50 border-red-100' :
                            'bg-gray-50/50 border-gray-100'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${approver.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                            approver.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                              'bg-gray-200 text-gray-500'
                            }`}>
                            {approver.status === 'APPROVED' ? <CheckCircle className="w-4 h-4" /> :
                              approver.status === 'REJECTED' ? <XCircle className="w-4 h-4" /> :
                                <Clock3 className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-[13px]">{approver.name}</p>
                            <p className="text-[11px] text-gray-500">Level {approver.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${approver.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                            approver.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-gray-200 text-gray-600 border-gray-300'
                            }`}>
                            {approver.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(selectedSubmission.status)} border-current bg-opacity-10`}>
                  {selectedSubmission.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate(`/${user.role.toLowerCase().replace('_admin', '')}/submissions/${selectedSubmission._id}`);
                }}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm shadow-md shadow-indigo-100"
              >
                View Full Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
