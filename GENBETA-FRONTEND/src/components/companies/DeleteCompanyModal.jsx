import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export function DeleteCompanyModal({ company, isOpen, onClose, onConfirm, loading }) {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Company?</h2>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete <span className="font-bold text-gray-700">{company.name}</span>? 
            This action will hide the company from the system.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              No, Keep it
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
