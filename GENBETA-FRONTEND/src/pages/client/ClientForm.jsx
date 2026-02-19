import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FacilityRenderer from "../../components/FacilityRenderer/FacilityRenderer";
import { formApi } from "../../api/form.api";
import { Loader2 } from "lucide-react";

export default function ClientFacility() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [Facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFacility();
  }, [FacilityId]);

  const loadFacility = async () => {
    try {
      setLoading(true);
      const response = await formApi.getFacilityById(formId);
      if (response.success) {
        setFacility(response.data);
      } else {
        setError(response.message || "Facility not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error loading form");
      console.error("Load form error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Facility Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The form you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {form.formName}
          </h1>
          <p className="text-gray-600">Please fill out all required fields</p>
        </div>

        {/* Facility */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in-up">
          <FacilityRenderer form={form} />
        </div>
      </div>
    </div>
  );
}

