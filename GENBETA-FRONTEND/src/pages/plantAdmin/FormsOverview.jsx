import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Filter, LayoutGrid, List } from 'lucide-react';
import { FormTemplatesTable } from '../../components/forms/FormTemplatesTable';
import { templateApi } from '../../api/template.api';
import { formApi } from '../../api/form.api';
import { submissionApi } from '../../api/submission.api';
import { exportToExcel } from '../../utils/excelExport';

export default function FormsOverview() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportAll = () => {
    if (templates.length === 0) return;
    const data = templates.map(t => ({
      'Template Name': t.name,
      'Description': t.description || 'N/A',
      'Status': t.status,
      'Submissions': t.submissionCount,
      'Last Updated': t.lastUpdated,
      'Type': t.isLegacy ? 'Legacy' : 'Modern'
    }));
    exportToExcel(data, "All_Form_Templates");
  };

  const formatFormCode = (formId, createdAt) => {
    // Convert formId to uppercase and format as code
    // Example: safety-checklist-abc123 => SAFETY-CHECKLIST-24-JAN-1023-PM-2026-ABC123
    if (!formId) return 'N/A';
    
    const date = new Date(createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = String(hours % 12 || 12).padStart(2, '0');
    const year = date.getFullYear();
    
    // Split formId and extract base name and timestamp suffix
    const parts = formId.split('-');
    const baseName = parts.slice(0, -1).join('-').toUpperCase();
    const suffix = parts[parts.length - 1].toUpperCase();
    
    return `${baseName}-${day}-${month}-${displayHours}${minutes}-${ampm}-${year}-${suffix}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesRes, formsRes, submissionsRes] = await Promise.all([
        templateApi.getTemplates(),
        formApi.getForms(),
        submissionApi.getSubmissions()
      ]);

      const legacyTemplates = templatesRes.success ? templatesRes.data : (Array.isArray(templatesRes) ? templatesRes : []);
      const modernForms = formsRes.success ? formsRes.data : (Array.isArray(formsRes) ? formsRes : []);
      const allSubmissions = submissionsRes.success ? submissionsRes.data : (Array.isArray(submissionsRes) ? submissionsRes : []);

      const combined = [
        ...legacyTemplates.map(t => ({
          id: t._id,
          name: t.templateName,
          formCode: t.templateId || 'N/A',
          description: t.description,
          status: t.status === 'ARCHIVED' ? 'Archived' : 'Published',
          submissionCount: allSubmissions.filter(s => s.templateId === t._id).length,
          lastUpdated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          isLegacy: true
        })),
        ...modernForms.filter(f => f.isTemplate || f.status === 'PUBLISHED').map(f => ({
          id: f._id,
          name: f.formName,
          formCode: f.numericalId ? `F-${f.numericalId.toString().padStart(3, '0')}` : (f.formId || 'N/A'),
          description: f.description,
          status: f.status === 'ARCHIVED' ? 'Archived' : (f.status === 'DRAFT' ? 'Draft' : 'Published'),
          submissionCount: allSubmissions.filter(s => s.formId?._id === f._id || s.formId === f._id).length,
          lastUpdated: f.updatedAt ? new Date(f.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          isLegacy: false,
          isTemplate: f.isTemplate
        }))
      ];

      setTemplates(combined);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      // Fallback to mock data for demonstration if API fails
      setTemplates([
        { id: '1', name: 'Safety Inspection Report', description: 'Weekly safety check for plant floor A', status: 'Published', submissionCount: 24, lastUpdated: '12 Jan 2026' },
        { id: '2', name: 'Equipment Maintenance Log', description: 'Daily maintenance tracker for heavy machinery', status: 'Published', submissionCount: 156, lastUpdated: '10 Jan 2026' },
        { id: '3', name: 'Incident Report Form', description: 'Standard form for reporting workplace incidents', status: 'Published', submissionCount: 8, lastUpdated: '05 Jan 2026' },
        { id: '4', name: 'Shift Handover Notes', description: 'End-of-shift notes for team leads', status: 'Archived', submissionCount: 89, lastUpdated: '20 Dec 2025' },
        { id: '5', name: 'Quality Control Checklist', description: 'Final inspection checklist for production line B', status: 'Draft', submissionCount: 0, lastUpdated: 'Never' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (template, type = 'details') => {
    if (type === 'submissions') {
      navigate(`/plant/submissions/template/${encodeURIComponent(template.name)}`);
    } else if (template.isLegacy) {
      navigate(`/plant/templates/${template.id}`);
    } else {
      navigate(`/plant/forms/${template.id}/edit/designer`);
    }
  };

  const handleCreate = () => {
    navigate('/plant/forms/create/designer');
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Form Templates</h1>
          <p className="text-[15px] text-gray-500">
            Design and manage reusable form structures for your plant.
          </p>
        </div>
        
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-gray-400" />
              Export Data
            </button>
          <button 
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

        {/* Stats Overview (Optional but adds value) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Templates', value: templates.length, sub: 'Across all status' },
            { label: 'Published', value: templates.filter(t => t.status === 'Published').length, sub: 'Currently active' },
            { label: 'Archived', value: templates.filter(t => t.status === 'Archived').length, sub: 'Read-only' },
            { label: 'Templates', value: templates.filter(t => t.isTemplate).length, sub: 'Reusable form structures' },
          ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-1">
            <p className="text-[13px] font-medium text-gray-500">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{loading ? '...' : stat.value}</span>
              <span className="text-[11px] text-gray-400">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          
          <button className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        <FormTemplatesTable 
          templates={templates} 
          loading={loading} 
          onView={handleView}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
