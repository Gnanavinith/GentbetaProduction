import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  User,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { userApi } from "../../../api/user.api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function WorkflowBuilder({ workflow = [], setWorkflow }) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.plantId) {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await userApi.getPlantEmployees(user.plantId);
      if (res.success && Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        toast.error("Failed to load employees");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading employees");
    }
    setLoading(false);
  };

  const addLevel = () => {
    setWorkflow(prev => {
      const currentWorkflow = Array.isArray(prev) ? prev : [];
      const newLevel = {
        id: `level-${Date.now()}`,
        name: `Approval Level ${currentWorkflow.length + 1}`,
        approverId: "",
        description: "Standard approval required"
      };
      return [...currentWorkflow, newLevel];
    });
  };

  const updateLevel = (id, updates) => {
    setWorkflow(prev => (Array.isArray(prev) ? prev : []).map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLevel = (id) => {
    setWorkflow(prev => (Array.isArray(prev) ? prev : []).filter(l => l.id !== id));
  };

  return (
    <div className="w-full px-8 py-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Approval Workflow</h2>
                <p className="text-sm text-slate-300">
                  Configure approval levels for this form
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {workflow.map((_, i) => (
                <span
                  key={i}
                  className="w-7 h-7 rounded-full bg-indigo-500 text-xs font-bold flex items-center justify-center"
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-8 py-6 bg-slate-50">
          <div className="space-y-5">

            <AnimatePresence>
              {workflow.map((level, index) => (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >

                  {/* LEVEL HEADER */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg font-bold flex items-center justify-center">
                        {index + 1}
                      </div>

                      <input
                        value={level.name}
                        onChange={(e) =>
                          updateLevel(level.id, { name: e.target.value })
                        }
                        className="w-full text-lg font-semibold bg-transparent outline-none border-b border-transparent focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLevel(level.id)}
                      className="text-slate-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* LEVEL CONTENT */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* APPROVER */}
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Approver
                      </label>
                      <select
                        value={level.approverId}
                        onChange={(e) =>
                          updateLevel(level.id, { approverId: e.target.value })
                        }
                        className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select approver</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name || emp.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Description / Rule
                      </label>
                      <input
                        value={level.description}
                        onChange={(e) =>
                          updateLevel(level.id, { description: e.target.value })
                        }
                        className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Approval condition"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* ADD LEVEL */}
            <button
              type="button"
              onClick={addLevel}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-indigo-500 hover:text-indigo-600 font-semibold transition"
            >
              + Add Approval Level
            </button>

            {workflow.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <ShieldCheck size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No approval workflow added</p>
                <p className="text-sm">Click “Add Approval Level” to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t bg-white flex justify-between text-xs text-slate-400">
          <span>Sequential approval flow</span>
          <span className="font-bold">v2.0</span>
        </div>

      </div>
    </div>
  );
}
