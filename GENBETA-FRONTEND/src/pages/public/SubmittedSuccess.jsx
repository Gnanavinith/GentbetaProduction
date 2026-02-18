import { CheckCircle2, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function SubmittedSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-green-100">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Submission Success!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your form has been successfully submitted and recorded. The plant administrator has been notified.
        </p>
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm mb-8">
          You can now close this window.
        </div>
        <p className="text-xs text-gray-400">
          Matapang &copy; 2025
        </p>
      </div>
    </div>
  );
}
