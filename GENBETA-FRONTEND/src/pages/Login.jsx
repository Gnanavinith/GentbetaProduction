import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Globe,
  Database,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

      try {
        const response = await api.post("/api/auth/login", {
          email,
          password,
        });

        const res = response.data;

        if (res?.token && res?.user) {
          login(res.token, res.user);
          toast.success(`Welcome back, ${res.user.name}!`);

          switch (res.user.role) {
            case "SUPER_ADMIN":
              navigate("/super/dashboard");
              break;
            case "COMPANY_ADMIN":
              navigate("/company/dashboard");
              break;
            case "PLANT_ADMIN":
              navigate("/plant/dashboard");
              break;
            default:
              navigate("/");
          }
        } else {
          const errorMsg = res?.message || "Invalid login credentials.";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err) {
        const errorMsg = err?.response?.data?.message ||
            err?.message ||
            "Something went wrong. Try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-50 via-indigo-50/20 to-white overflow-hidden">
      {/* LEFT BRAND SECTION */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white"
      >
        <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800" />

        <div className="relative z-10 p-20 flex flex-col justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">GenBeta</h1>
          </div>

          <div>
            <h2 className="text-5xl font-extrabold leading-tight mb-6">
              Facility <br />
              Management
            </h2>
            <p className="text-lg text-indigo-100 max-w-lg mb-10">
              Centralized management with real-time approvals.
            </p>

            <div className="space-y-4">
              {[
                { icon: Zap, text: "Instant Approval Automation" },
                { icon: Database, text: "Secure Compliance" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-indigo-200" />
                  <span className="text-indigo-50">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-indigo-200">
            Trusted by enterprises worldwide
          </p>
        </div>
      </motion.div>

      {/* RIGHT LOGIN FORM */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6"
      >
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-slate-200/60">
          {/* Mobile Branding */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="p-3 bg-indigo-600 rounded-xl mb-3">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">GenBeta</h2>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl font-extrabold text-gray-900">Sign In</h3>
            <p className="text-gray-500 mt-1">

            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-600 font-semibold"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
              <span className="text-sm text-gray-600">
                Remember this device
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-70 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>



          <div className="mt-10 text-center text-xs text-gray-400">
            Enterprise-grade security & compliance
          </div>
        </div>
      </motion.div>
    </div>
  );
}
