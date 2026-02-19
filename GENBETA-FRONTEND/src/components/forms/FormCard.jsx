import { useNavigate } from "react-router-dom";

export default function FacilityCard({ form }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 group cursor-pointer transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="font-bold text-xl text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
            {form.formName}
          </h2>
          <p className="text-xs text-gray-500 font-mono">{form.formId}</p>
        </div>
        <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          Active
        </span>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 flex-1 text-center border border-indigo-100">
          <p className="text-2xl font-bold text-indigo-600">{form.fieldCount || 0}</p>
          <p className="text-xs text-gray-600 font-medium mt-1">Fields</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 flex-1 text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{form.submissionCount || 0}</p>
          <p className="text-xs text-gray-600 font-medium mt-1">Responses</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
          onClick={() => navigate(`/forms/${form.formId}`)}
        >
          View Details
        </button>
        <button
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-semibold"
          onClick={() => navigate(`/forms/${form.formId}/fill`)}
        >
          Fill Facility
        </button>
      </div>
    </div>
  );
}
