import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function SubmissionSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center animate-fade-in-up">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Form Submitted Successfully!
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Your form submission has been received and will be reviewed by the admin team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

