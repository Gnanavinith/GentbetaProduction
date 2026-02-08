import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import FormRenderer from "../../components/FormRenderer/FormRenderer";
import { CheckCircle2, AlertCircle, Loader2, FileText, ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function ApprovalPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [completedForms, setCompletedForms] = useState([]);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isMultiForm, setIsMultiForm] = useState(false);

  useEffect(() => {
    fetchForms();
  }, [token]);

  const fetchForms = async () => {
    try {
      const res = await axios.get(`/api/approve/${token}`);
      const formsData = res.data.forms || [res.data.form];
      setForms(formsData);
      setCompletedForms(res.data.completedForms || []);
      setIsMultiForm(res.data.isMultiForm || formsData.length > 1);
      
      const firstPendingIndex = formsData.findIndex(
        f => !res.data.completedForms?.includes(f._id)
      );
      setCurrentFormIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired approval link");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const currentForm = forms[currentFormIndex];
      const res = await axios.post(`/api/approve/${token}`, { 
        formId: currentForm._id,
        data: formData 
      });
      
      setCompletedForms(prev => [...prev, currentForm._id]);
      
      if (res.data.allFormsCompleted) {
        navigate("/submitted");
      } else {
        const nextPendingIndex = forms.findIndex(
          (f, idx) => idx > currentFormIndex && !completedForms.includes(f._id) && f._id !== currentForm._id
        );
        if (nextPendingIndex >= 0) {
          setCurrentFormIndex(nextPendingIndex);
        } else {
          const firstPending = forms.findIndex(
            f => !completedForms.includes(f._id) && f._id !== currentForm._id
          );
          if (firstPending >= 0) {
            setCurrentFormIndex(firstPending);
          } else {
            navigate("/submitted");
          }
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-400">Please contact the administrator for a new link.</p>
        </div>
      </div>
    );
  }

  const currentForm = forms[currentFormIndex];
  const isCurrentFormCompleted = completedForms.includes(currentForm?._id);
  const pendingCount = forms.filter(f => !completedForms.includes(f._id)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {isMultiForm && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">
                {pendingCount} of {forms.length} forms remaining
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentFormIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentFormIndex === 0}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentFormIndex(prev => Math.min(forms.length - 1, prev + 1))}
                  disabled={currentFormIndex === forms.length - 1}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {forms.map((form, idx) => (
                <button
                  key={form._id}
                  onClick={() => setCurrentFormIndex(idx)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    idx === currentFormIndex
                      ? 'bg-indigo-600 text-white'
                      : completedForms.includes(form._id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {completedForms.includes(form._id) && (
                    <Check className="w-4 h-4" />
                  )}
                  {form.formName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold tracking-wider uppercase text-sm opacity-80">
                {isMultiForm ? `Form ${currentFormIndex + 1} of ${forms.length}` : 'Approval Required'}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{currentForm?.formName}</h1>
            <p className="mt-2 text-indigo-100 opacity-90">Please review the details below and provide your input.</p>
          </div>
          
          <div className="p-8 md:p-12">
            {isCurrentFormCompleted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Form Already Submitted</h3>
                <p className="text-gray-500">This form has already been completed. Please select another form from the list above.</p>
              </div>
            ) : (
              <FormRenderer 
                fields={currentForm?.fields || []} 
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 GenBeta. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
