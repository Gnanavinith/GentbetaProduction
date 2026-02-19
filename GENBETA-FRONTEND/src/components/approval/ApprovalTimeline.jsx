import { useState, useEffect } from "react";
import {
  X,
  Search,
  User as UserIcon,
  CheckCircle2
} from "lucide-react";
import api from "../../api/api";

export default function ApproverSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  selectedFacilitys = []
}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApprover, setSelectedApprover] = useState(null);

  useEffect(() => {
    if (isOpen) fetchEmployees();
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.plantId) {
        const res = await api.get(`/users/plant/${user.plantId}/employees`);
        setEmployees(res.data.data || []);
      }
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    [emp.name, emp.email, emp.position]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="px-8 py-6 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Assign Facility
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose an employee to receive {selectedFacilitys.length} form(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-8 overflow-y-auto">

          {/* LEFT – SUMMARY */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              Selected Facilitys
            </h4>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {selectedFacilitys.map((form, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="font-semibold text-slate-800 truncate">
                    {form.formName}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT – EMPLOYEE PICKER */}
          <div className="flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              Select Employee
            </h4>

            {/* SEARCH */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search employee..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
              />
            </div>

            {/* LIST */}
            <div className="space-y-3 overflow-y-auto pr-2 max-h-[300px]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-slate-100 animate-pulse"
                  />
                ))
              ) : filteredEmployees.length ? (
                filteredEmployees.map(emp => {
                  const active = selectedApprover?._id === emp._id;
                  return (
                    <button
                      key={emp._id}
                      onClick={() => setSelectedApprover(emp)}
                      className={`w-full p-4 rounded-2xl border flex gap-4 text-left transition ${
                        active
                          ? "border-indigo-600 bg-indigo-50 shadow-md"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <UserIcon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {emp.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {emp.position || "Employee"}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed">
                  <UserIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    No employees found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 bg-slate-50 border-t flex justify-between items-center">
          <p className="text-sm text-slate-500 hidden sm:block">
            {selectedApprover
              ? `Selected: ${selectedApprover.name}`
              : "Select an employee to continue"}
          </p>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl border font-bold text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
            <button
              disabled={!selectedApprover}
              onClick={() => onConfirm(selectedApprover._id)}
              className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed shadow-lg"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
