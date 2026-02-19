import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { approvalApi } from "../../api/approval.api";
import { submissionApi } from "../../api/submission.api";
import FacilityRenderer from "../../components/FormRenderer/FormRenderer";
import { 
  ArrowLeft, 
  Loader2, 
  FileText, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  AlertCircle,
  Edit3
} from "lucide-react";

export default function BulkApprovalPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFacility, setActiveFacility] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedFacilitys, setCompletedFacilitys] = useState([]);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await approvalApi.getApprovalTaskDetails(taskId);
      if (response.success) {
        setTask(response.data);
        setCompletedFacilitys(response.data.completedFacilitys?.map(f => f._id || f) || []);
      } else {
        setError(response.message || "Failed to load task details");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFacilitySubmit = async (formData, files) => {
    if (!activeFacility) return;
    
    setSubmitting(true);
    try {
      // Create a submission for this specific form in the task
      const response = await submissionApi.createSubmission(
        activeFacility._id,
        formData,
        files,
        "APPROVED", // Internal completion
        taskId
      );

        if (response.success) {
          toast.success("Facility submitted successfully");
          setCompletedFacilitys(prev => [...prev, activeFacility._id]);
          setActiveFacility(null);
          
          // Refresh task details to get updated progress
          fetchTaskDetails();
        } else {
          toast.error(response.message || "Failed to submit form");
        }
      } catch (err) {
        toast.error("Failed to submit form");
      } finally {
        setSubmitting(false);
      }
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate("/employee")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-600 font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate("/employee")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bulk Approval Task</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Assigned by: {task.submittedBy?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                    completedFacilitys.length === task.formIds.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {completedFacilitys.length === task.formIds.length ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 mb-1">Overall Progress</p>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${(completedFacilitys.length / task.formIds.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {completedFacilitys.length}/{task.formIds.length}
              </span>
            </div>
          </div>
        </div>

        {activeFacility ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Filling: {activeFacility.formName}
              </h3>
              <button 
                onClick={() => setActiveFacility(null)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel & Return to List
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-1 border border-gray-100">
              <FacilityRenderer
                fields={activeFacility.fields || []}
                sections={activeFacility.sections || []}
                onSubmit={handleFacilitySubmit}
                submitting={submitting}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Facilitys in this Task</h2>
            <div className="grid gap-4">
              {task.formIds.map((form) => {
                const isCompleted = completedFacilitys.includes(form._id);
                return (
                  <div 
                    key={form._id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isCompleted 
                        ? 'bg-green-50 border-green-100' 
                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isCompleted ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className={`font-bold ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                          {form.formName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isCompleted ? 'Submitted' : 'Pending review and data entry'}
                        </p>
                      </div>
                    </div>
                    
                    {!isCompleted && (
                      <button
                        onClick={() => setActiveFacility(form)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm"
                      >
                        Open Facility
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    
                    {isCompleted && (
                      <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Done
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!activeFacility && completedFacilitys.length === task.formIds.length && (
        <div className="bg-green-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-green-200 animate-in zoom-in duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Task Completed!</h3>
              <p className="text-green-50">All forms have been successfully processed and submitted.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/employee")}
            className="px-6 py-2 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-sm"
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}
