import React, { useState } from 'react';
import { Search, ChevronDown, ArrowRight, FileText, Inbox, Plus } from 'lucide-react';

/**
 * A compact, professional table view for form templates and submission data.
 * Inspired by Notion, Linear, and Jira.
 */
export function FormTemplatesTable({ 
  templates = [], 
  loading = false, 
  onView = () => {}, 
  onCreate = () => {} 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = (template.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (template.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (template.formCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'archived':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'draft':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  if (!loading && templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold mb-1">No forms found</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">
          You haven't created any form templates yet. Start by creating your first template.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create template
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
            <option value="Draft">Draft</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Form Code
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Latest Activity
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32 mb-2"></div><div className="h-3 bg-gray-50 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <tr 
                    key={template.id} 
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => onView(template)}
                  >
                    <td className="px-6 py-4 min-w-[240px]">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 rounded-md transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {template.name}
                          </div>
                          <div className="text-[12px] text-gray-500 leading-tight mt-0.5 line-clamp-1">
                            {template.description || 'No description provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                        {template.formCode || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(template, 'submissions');
                        }}
                        className="text-sm font-medium text-gray-700 hover:text-indigo-600 hover:underline transition-colors"
                      >
                        {template.submissionCount || 0}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500">
                      {template.lastUpdated || 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusStyle(template.status)}`}>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(template);
                        }}
                        className="inline-flex items-center text-[13px] font-semibold text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    No results matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
