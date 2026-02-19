import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FacilityRenderer from "../FacilityRenderer/FacilityRenderer";
import { formApi } from "../../api/form.api";

export default function FacilityDetails() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [Facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFacility = useCallback(async () => {
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
  }, [FacilityId]);

  useEffect(() => {
    loadFacility();
  }, [loadFacility]);

  if (loading) {
    return (
      <div className="p-6 text-center py-12">
        <div className="text-lg">Loading form...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Facility not found"}
        </div>
        <button
          onClick={() => navigate("/forms")}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Back to Facilitys
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <button
          onClick={() => navigate("/forms")}
          className="text-indigo-600 hover:text-indigo-800 mb-4"
        >
          ← Back to Facilitys
        </button>
        <h1 className="text-2xl font-bold">{form.formName}</h1>
        <p className="text-sm text-gray-500 mt-1">Facility ID: {form.formId}</p>
      </div>

      <FacilityRenderer form={form} />
    </div>
  );
}
