import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  Paperclip,
  GitBranch,
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import { format } from "date-fns";
import ApprovalWorkflowDisplay from "../../components/forms/ApprovalWorkflowDisplay";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getFormFields = (form) => {
  if (!form) return [];
  let allFields = [...(form.fields || [])];
  if (form.sections) {
    form.sections.forEach((section) => {
      if (section.fields) allFields = [...allFields, ...section.fields];
    });
  }
  const uniqueFields = [];
  const seenIds = new Set();
  allFields.forEach((field) => {
    const fieldId = field.fieldId || field.id;
    if (
      fieldId &&
      !seenIds.has(fieldId) &&
      !["section-divider", "section-header", "spacer", "columns-2", "columns-3"].includes(field.type)
    ) {
      seenIds.add(fieldId);
      uniqueFields.push(field);
    }
  });
  return uniqueFields;
};

const getColLabel = (col, idx) =>
  col?.label || col?.header || col?.name || col?.title || `Column ${idx + 1}`;

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status, currentLevel, totalLevels, form, size = "md" }) {
  const statusConfig = {
    DRAFT:            { color: "bg-gray-100 text-gray-700 ring-gray-200",     icon: FileText,    label: "Draft"            },
    SUBMITTED:        { color: "bg-blue-50 text-blue-700 ring-blue-200",      icon: Send,        label: "Submitted"        },
    PENDING_APPROVAL: { color: "bg-amber-50 text-amber-700 ring-amber-200",   icon: Clock,       label: "Pending Approval" },
    APPROVED:         { color: "bg-green-50 text-green-700 ring-green-200",   icon: CheckCircle, label: "Approved"         },
    REJECTED:         { color: "bg-red-50 text-red-700 ring-red-200",         icon: XCircle,     label: "Rejected"         },
  };
  const config = statusConfig[status] || statusConfig.DRAFT;
  const Icon = config.icon;
  let calculatedTotalLevels = totalLevels;
  if (!calculatedTotalLevels && form?.approvalFlow) calculatedTotalLevels = form.approvalFlow.length;
  const displayLabel =
    status === "PENDING_APPROVAL" && currentLevel && calculatedTotalLevels
      ? `Level ${currentLevel}/${calculatedTotalLevels}`
      : config.label;

  const sizeClass = size === "sm"
    ? "px-2.5 py-0.5 text-xs gap-1.5"
    : "px-3 py-1 text-sm gap-2";

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ring-1 ${config.color} ${sizeClass}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {displayLabel}
    </span>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, subtitle, children, noPadding = false }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="p-1.5 bg-indigo-50 rounded-lg">
          <Icon className="w-4 h-4 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className={noPadding ? "" : "p-6"}>
        {children}
      </div>
    </div>
  );
}

// ─── Grid Table Renderer ─────────────────────────────────────────────────────

function GridTableRenderer({ value, field }) {
  const scrollRef = useRef(null);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return <pre className="text-sm text-gray-600">{JSON.stringify(value, null, 2)}</pre>;
  }

  const rowEntries = Object.entries(value);
  if (rowEntries.length === 0) return <span className="text-gray-400 italic text-sm">No data</span>;

  const fieldColumns = field?.columns || [];
  const allColKeys = fieldColumns.length > 0
    ? fieldColumns.map((c) => c.id || c.fieldId)
    : [...new Set(rowEntries.flatMap(([, row]) => Object.keys(row || {})))];

  const colLabelMap = {};
  if (fieldColumns.length > 0) {
    fieldColumns.forEach((col) => {
      const key = col.id || col.fieldId;
      if (key) colLabelMap[key] = getColLabel(col, 0);
    });
  } else {
    allColKeys.forEach((key, idx) => {
      colLabelMap[key] = key.replace(/^col(\d+)$/i, "Column $1") || `Col ${idx + 1}`;
    });
  }

  const rowLabelMap = {};
  if (field?.items) {
    field.items.forEach((item) => {
      const key = item.id || item.fieldId;
      if (key) rowLabelMap[key] = item.question || item.label || key;
    });
  }

  const COL_W   = 140;
  const LABEL_W = 180;
  const totalW  = LABEL_W + allColKeys.length * COL_W;

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden w-full">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <TableIcon size={13} className="text-indigo-400" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {rowEntries.length} {rowEntries.length === 1 ? "Row" : "Rows"} · {allColKeys.length} Columns
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onMouseDown={(e) => { e.preventDefault(); scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" }); }} className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all">
            <ChevronLeft size={13} />
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" }); }} className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} style={{ display: "block", width: "100%", overflowX: "scroll", overflowY: "auto", maxHeight: "420px", WebkitOverflowScrolling: "touch", scrollbarWidth: "thin", scrollbarColor: "#a5b4fc #f1f5f9" }}>
        <table style={{ tableLayout: "fixed", width: `${totalW}px`, minWidth: `${totalW}px`, borderCollapse: "collapse" }} className="text-[13px]">
          <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
            <tr>
              <th style={{ width: `${LABEL_W}px`, minWidth: `${LABEL_W}px`, position: "sticky", left: 0, zIndex: 5, backgroundColor: "#eef2ff" }} className="px-4 py-3 text-left text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-r-2 border-indigo-100 whitespace-nowrap">
                Row / Question
              </th>
              {allColKeys.map((colKey) => (
                <th key={colKey} style={{ width: `${COL_W}px`, minWidth: `${COL_W}px`, backgroundColor: "#eef2ff" }} className="px-4 py-3 text-left text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-r border-indigo-100 last:border-r-0 whitespace-nowrap">
                  {colLabelMap[colKey] || colKey}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowEntries.map(([itemId, rowData], ri) => {
              const rowLabel = rowLabelMap[itemId] || `Row ${ri + 1}`;
              const isEven   = ri % 2 === 0;
              return (
                <tr key={itemId} className={`border-b border-slate-100 last:border-0 transition-colors group hover:bg-indigo-50/30 ${isEven ? "bg-white" : "bg-slate-50/40"}`}>
                  <td style={{ position: "sticky", left: 0, zIndex: 1, backgroundColor: isEven ? "white" : "#f8fafc", width: `${LABEL_W}px` }} className="px-4 py-3 border-r-2 border-slate-200 group-hover:bg-indigo-50/30">
                    <span className="text-[12px] font-semibold text-slate-700 whitespace-nowrap">{rowLabel}</span>
                  </td>
                  {allColKeys.map((colKey) => {
                    const cellVal = rowData?.[colKey];
                    const isEmpty = cellVal === undefined || cellVal === null || cellVal === "";
                    return (
                      <td key={colKey} style={{ width: `${COL_W}px` }} className="px-4 py-3 border-r border-slate-100 last:border-r-0">
                        {isEmpty ? <span className="text-slate-300 text-xs italic">—</span> : <span className="text-[13px] text-slate-800">{String(cellVal)}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {allColKeys.length > 4 && (
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 border-t border-indigo-100 flex items-center gap-2">
          {[0, 150, 300].map((d, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${d}ms` }} />)}
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">↔ Scroll horizontally to see all {allColKeys.length} columns</span>
        </div>
      )}
    </div>
  );
}

// ─── Field Value Renderer ────────────────────────────────────────────────────

function renderFieldValue(value, field) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "string") {
    try { const parsed = JSON.parse(value); return renderFieldValue(parsed, field); } catch {}
  }

  if (typeof value === "object" && !Array.isArray(value) && value.url) {
    return (
      <div className="space-y-2">
        <a href={value.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 underline text-sm font-medium">
          <FileText size={14} />{value.filename || "View File"}
        </a>
        {value.size && <span className="text-gray-400 text-xs ml-2">({(value.size / 1024 / 1024).toFixed(2)} MB)</span>}
        {value.mimetype?.startsWith("image") && <img src={value.url} className="mt-2 max-w-[180px] rounded-lg border shadow-sm" alt="" />}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v, i) => (
          <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">{String(v)}</span>
        ))}
      </div>
    );
  }

  if (typeof value === "string" && value.includes("@")) {
    return <a href={`mailto:${value}`} className="text-indigo-600 hover:text-indigo-800 underline text-sm">{value}</a>;
  }

  if (typeof value === "string" && /^\+?[1-9][\d\-\s()]{6,}$/.test(value)) {
    return <a href={`tel:${value}`} className="text-indigo-600 hover:text-indigo-800 underline text-sm">{value}</a>;
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try { return <span className="text-sm text-slate-800">{new Date(value).toLocaleDateString()}</span>; } catch { return <span className="text-sm text-slate-800">{String(value)}</span>; }
  }

  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
    try {
      const date = new Date(); date.setHours(0, 0, 0, 0);
      const p = value.split(":"); date.setHours(parseInt(p[0]), parseInt(p[1]));
      return <span className="text-sm text-slate-800">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>;
    } catch { return <span className="text-sm text-slate-800">{String(value)}</span>; }
  }

  if (typeof value === "string" && value.startsWith("http")) {
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(value);
    return (
      <div className="space-y-2">
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline text-sm">View File →</a>
        {isImage && <img src={value} className="mt-1 max-w-[180px] rounded-lg border shadow-sm" alt="preview" />}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${value ? "bg-green-50 text-green-700 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    const isDateRange = keys.some(key => ['startDate', 'endDate', 'start', 'end'].includes(key));
    if (isDateRange && keys.length <= 4) {
      return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Row", "Start Date", "End Date"].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {Object.entries(value).map(([key, dateObj], index) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs font-semibold text-gray-700">Row {index + 1}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{dateObj.startDate || dateObj.start || dateObj[0] || "N/A"}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{dateObj.endDate || dateObj.end || dateObj[1] || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const firstVal = keys.length > 0 ? value[keys[0]] : null;
    const isGridTable = field?.type === "grid-table" || (firstVal !== null && typeof firstVal === "object" && !firstVal.url);
    if (isGridTable) return <GridTableRenderer value={value} field={field} />;

    return (
      <div className="space-y-1.5 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
        {keys.map((k) => (
          <div key={k} className="flex gap-3 text-sm">
            <span className="font-semibold text-slate-500 capitalize min-w-[80px]">{k}</span>
            <span className="text-slate-800">{String(value[k])}</span>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-sm text-slate-800">{String(value)}</span>;
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <div className="animate-pulse">
        <div className="h-4 w-32 bg-gray-100 rounded mb-6" />
        <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-40 bg-gray-100 rounded mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[0,1,2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-8 h-8 bg-gray-100 rounded-xl mb-4" />
              <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
              <div className="h-5 w-28 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-72" />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SubmissionDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => { fetchSubmission(); }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionApi.getSubmissionById(id);
      if (response.success) {
        setSubmission(response.data);
      } else {
        setError(response.message || "Submission not found");
      }
    } catch (err) {
      setError("Failed to load submission: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">{error || "Submission not found"}</h3>
          <p className="text-sm text-gray-400 mb-6">This submission could not be loaded or doesn't exist.</p>
          <button onClick={() => navigate("/plant/submissions")} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  const formFields = submission.formId ? getFormFields(submission.formId) : [];

  const fieldRows = (
    formFields.length > 0
      ? formFields.map((field) => {
          const rawValue = submission.data?.[field.fieldId] ?? submission.data?.[field.id];
          if (rawValue === undefined || rawValue === null || rawValue === "") return null;
          let parsed = rawValue;
          if (typeof rawValue === "string") { try { parsed = JSON.parse(rawValue); } catch {} }
          const rendered = renderFieldValue(parsed, field);
          if (!rendered) return null;
          return { label: field.label || field.question || field.fieldId, rendered, key: field.fieldId || field.id };
        })
      : Object.entries(submission.data || {}).map(([key, rawValue]) => {
          if (rawValue === undefined || rawValue === null || rawValue === "") return null;
          let parsed = rawValue;
          if (typeof rawValue === "string") { try { parsed = JSON.parse(rawValue); } catch {} }
          const rendered = renderFieldValue(parsed, null);
          if (!rendered) return null;
          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
          return { label, rendered, key };
        })
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* ── Back + Header ── */}
        <div>
          <button onClick={() => navigate("/plant/submissions")} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors mb-5 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Submissions
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{submission.formName}</h1>
              <p className="mt-1 text-sm text-gray-400 font-medium">
                {submission.readableId
                  ? `ID: ${submission.readableId}`
                  : `#${submission.numericalId || submission._id?.slice(-8)}`}
              </p>
            </div>
            <div className="flex-shrink-0">
              <StatusBadge status={submission.status} currentLevel={submission.currentLevel} totalLevels={submission.totalLevels} form={submission.formId} />
            </div>
          </div>
        </div>

        {/* ── Meta Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Submitted At */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted</span>
            </div>
            <p className="text-sm font-bold text-gray-900 leading-snug">
              {format(new Date(submission.submittedAt), "MMM d, yyyy")}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {format(new Date(submission.submittedAt), "h:mm a")}
            </p>
          </div>

          {/* Submitted By */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <User className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted By</span>
            </div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{submission.submittedByName}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{submission.submittedByEmail}</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
            </div>
            <StatusBadge status={submission.status} currentLevel={submission.currentLevel} totalLevels={submission.totalLevels} form={submission.formId} size="sm" />
            {submission.currentLevel && (
              <p className="text-xs text-gray-400 font-medium mt-2">
                Approval level {submission.currentLevel} of {submission.totalLevels || "?"}
              </p>
            )}
          </div>
        </div>

        {/* ── Approval Workflow ── */}
        {submission.formId && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <GitBranch className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Approval Workflow</h2>
                <p className="text-xs text-gray-400 font-medium">Review chain for this form</p>
              </div>
            </div>
            <div className="p-6">
              <ApprovalWorkflowDisplay form={submission.formId} className="shadow-none" />
            </div>
          </div>
        )}

        {/* ── Form Data ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <FileText className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Form Data</h2>
                <p className="text-xs text-gray-400 font-medium">{fieldRows.length} fields</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {submission.data && fieldRows.length > 0
              ? fieldRows.map(({ label, rendered, key }) => (
                  <div key={key} className="px-6 py-4 grid grid-cols-[220px_1fr] gap-6 items-start hover:bg-gray-50/50 transition-colors">
                    <div className="pt-0.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        {label}
                      </span>
                    </div>
                    <div className="min-w-0">{rendered}</div>
                  </div>
                ))
              : (
                <div className="px-6 py-12 text-center">
                  <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 italic">No form data available</p>
                </div>
              )}
          </div>
        </div>

        {/* ── Uploaded Files ── */}
        {submission.files && submission.files.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Paperclip className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Uploaded Files</h2>
                <p className="text-xs text-gray-400 font-medium">{submission.files.length} attachment{submission.files.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {submission.files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                  <div className="p-1.5 bg-gray-50 group-hover:bg-white rounded-lg border border-gray-100 transition-colors flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <a
                    href={file.url.includes("cloudinary.com") && file.mimetype?.startsWith("application/pdf") ? file.url.replace("/upload/", "/upload/f_auto/") : file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium truncate flex-1"
                  >
                    {file.filename || file.url}
                  </a>
                  {file.size && (
                    <span className="text-xs text-gray-400 font-medium flex-shrink-0 bg-gray-50 px-2 py-0.5 rounded-lg">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Approval History ── */}
        {submission.approvalHistory && submission.approvalHistory.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Approval History</h2>
                <p className="text-xs text-gray-400 font-medium">{submission.approvalHistory.length} action{submission.approvalHistory.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="p-6">
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-5">
                  {submission.approvalHistory.map((history, index) => {
                    const isApproved = history.status === "APPROVED";
                    return (
                      <div key={index} className="flex gap-4 items-start relative">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 ring-4 ring-white ${isApproved ? "bg-green-50" : "bg-red-50"}`}>
                          {isApproved
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">Level {history.level}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isApproved ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                {history.status}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">
                              {format(new Date(history.actionedAt), "MMM d, yyyy · h:mm a")}
                            </span>
                          </div>
                          {history.comments && (
                            <p className="mt-1.5 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">
                              "{history.comments}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}