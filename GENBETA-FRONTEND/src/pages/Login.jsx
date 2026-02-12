import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  ShieldCheck,
  Zap,
  ChevronRight,
  Loader2,
  Database,
  Building2,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", { email, password });
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
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">

      {/* LEFT PANEL */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 bg-slate-900 text-white p-20 flex-col justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
            <ShieldCheck className="w-7 h-7 text-slate-200" />
          </div>
          <h1 className="text-3xl font-black">Matapang</h1>
        </div>

        <div>
          <h2 className="text-4xl font-black leading-[1.1] mb-8">
            Enterprise
            Facility
            Management
          </h2>

          <p className="text-slate-300 mb-10 max-w-lg">
            Streamlined operations with real-time approvals and compliance monitoring.
          </p>

          <div className="space-y-6">
            {[
              { icon: Zap, text: "Lightning-fast approvals" },
              { icon: Database, text: "Enterprise security" },
              { icon: Building2, text: "Multi-site management" },
              { icon: Users, text: "Role-based access" },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                  <f.icon className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-slate-200 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* RIGHT LOGIN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-6"
      >
        <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-xl border border-slate-200">

          <div className="flex flex-col items-center mb-10">
            <div className="p-3 bg-slate-900 rounded-xl mb-4">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Matapang</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to your workspace</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

        <form onSubmit={submit} className="space-y-6">

  {/* Email */}
  <div>
    <label className="text-sm font-medium text-slate-700">Email</label>

    <div className="relative mt-2">
      <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@company.com"
        className="w-full pl-12 py-4 rounded-xl border border-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-slate-400 focus:outline-none"
      />
    </div>
  </div>

  {/* Password */}
  <div>
    <label className="text-sm font-medium text-slate-700">Password</label>

    <div className="relative mt-2">
      <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />

      <input
        type={showPassword ? "text" : "password"}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-slate-400 focus:outline-none"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>

  {/* Submit */}
  <button
    type="submit"
    disabled={loading}
    className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex justify-center items-center gap-2 transition"
  >
    {loading ? (
      <Loader2 className="animate-spin w-5 h-5" />
    ) : (
      <>
        Sign In
        <ChevronRight className="w-4 h-4" />
      </>
    )}
  </button>

</form>


          <div className="mt-8 text-center text-xs text-slate-400">
            Secure enterprise authentication
          </div>
        </div>
      </motion.div>
    </div>
  );
}
