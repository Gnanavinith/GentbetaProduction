import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../api/user.api";

export default function ApproverSelectionModal({ isOpen, onClose, onConfirm, selectedForms = [] }) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setSelectedEmployeeId("");
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      if (user?.plantId) {
        const response = await userApi.getPlantEmployees(user.plantId);
        if (response.success) {
          setEmployees(response.data);
        } else {
          setEmployees([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign to Employee</h2>
            <p className="text-sm text-gray-500">Choose an employee to receive these templates</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Employee
            </label>
            <select
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? "Loading employees..." : "Select employee"}</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} — {employee.position || 'Employee'}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Templates to be assigned
            </p>
            <ul className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {selectedForms.map((form, idx) => (
                <li key={form._id || idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span className="truncate">{form.formName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedEmployeeId || loading}
            onClick={() => onConfirm(selectedEmployeeId)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}