import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import FormRenderer from "../../components/FormRenderer/FormRenderer";

export default function EditSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionApi.getSubmissionById(id);
      if (response.success) {
        setSubmission(response.data);
        setFormData(response.data.data || {});
      } else {
        setError("Submission not found");
      }
    } catch (err) {
      setError("Failed to load submission");
      console.error("Error fetching submission:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await submissionApi.updateSubmission(id, { data: formData });
      navigate(`/employee/submissions/${id}`);
    } catch (err) {
      console.error("Error saving submission:", err);
      setError("Failed to save submission");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/employee/submissions/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white p-8 rounded-lg border border-gray-200 h-96"></div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <X className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{error || "Submission not found"}</h3>
          <button
            onClick={() => navigate("/employee/submissions")}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  if (submission.status !== "DRAFT") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <X className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Cannot edit this submission</h3>
          <p className="mt-1 text-gray-600">Only draft submissions can be edited</p>
          <button
            onClick={() => navigate(`/employee/submissions/${id}`)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            View Submission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/employee/submissions/${id}`)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submission
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Submission</h1>
            <p className="mt-1 text-gray-600">{submission.formName}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <FormRenderer
            formDefinition={{
              fields: submission.formId?.fields || [],
              sections: submission.formId?.sections || []
            }}
            initialData={formData}
            onSubmit={(data) => setFormData(data)}
            showSubmitButton={false}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}