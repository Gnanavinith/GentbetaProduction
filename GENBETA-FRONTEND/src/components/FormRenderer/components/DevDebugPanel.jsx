import React from 'react';

// Development debug panel - shows raw field structure for debugging
export default function DevDebugPanel({ field, value }) {
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="text-sm font-bold text-yellow-800 mb-2">🔧 Dev Debug Panel</h4>
      <div className="text-xs text-yellow-700 space-y-2">
        <div>
          <strong>Field Structure:</strong>
          <pre className="mt-1 p-2 bg-yellow-100 rounded text-xs overflow-auto">
            {JSON.stringify(field, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Current Value:</strong>
          <pre className="mt-1 p-2 bg-yellow-100 rounded text-xs overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
        <div className="text-xs text-yellow-600">
          <p><strong>Key Mapping Info:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Column labels: {field.columns?.map((col, i) => 
              `${i+1}. ${col.label || col.header || col.name || col.title || 'N/A'}`
            ).join(', ') || 'None'}</li>
            <li>Row keys: {field.items?.map((item, i) => 
              `${i+1}. ${item.id || item.fieldId || 'N/A'}`
            ).join(', ') || 'None'}</li>
            <li>Column keys: {field.columns?.map((col, i) => 
              `${i+1}. ${col.id || col.fieldId || 'N/A'}`
            ).join(', ') || 'None'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}