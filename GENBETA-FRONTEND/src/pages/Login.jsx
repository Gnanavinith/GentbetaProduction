import { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  BarChart3,
  HardHat,
  Factory,
  ArrowRight,
} from "lucide-react";
import logo from "../assets/MatapanLogo.png";

const features = [
  {
    icon: Factory,
    title: "Smart Facility Management",
    description: "AI-powered insights for optimal facility operations",
    accent: "#FF6B35",
    bg: "from-orange-400 to-rose-500",
  },
  {
    icon: HardHat,
    title: "Workforce Coordination",
    description: "Real-time task allocation and progress tracking",
    accent: "#00C9A7",
    bg: "from-emerald-400 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive dashboards with predictive metrics",
    accent: "#7C3AED",
    bg: "from-violet-400 to-purple-500",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance automation",
    accent: "#F59E0B",
    bg: "from-amber-400 to-orange-500",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
        const dashboardRoutes = {
          SUPER_ADMIN: "/super/dashboard",
          COMPANY_ADMIN: "/company/dashboard",
          PLANT_ADMIN: "/plant/dashboard",
        };
        navigate(dashboardRoutes[res.user.role] || "/");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const current = features[activeFeature];
  const FeatureIcon = current.icon;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── LEFT PANEL – White/Light so black logo is visible ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden bg-white">

        {/* Animated gradient blob background */}
        {/* Static background (no animation) */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-tr from-sky-200 to-blue-300 opacity-25 blur-2xl -translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-violet-200 to-pink-200 opacity-20 blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>


        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">

          {/* Logo – on white bg, black logo is perfectly visible */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-slate-100">
              <img src={logo} alt="Matapang" className="h-10 w-auto" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Matapang</span>
              <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">Enterprise Platform</p>
            </div>
          </motion.div>

          {/* Feature Showcase */}
          <div className="flex-1 flex flex-col justify-center mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
              >
                {/* Icon badge */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${current.bg} shadow-lg mb-6`}
                >
                  <FeatureIcon className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 leading-tight mb-3">
                  {current.title}
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed max-w-xs">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Feature dots */}
            <div className="flex items-center gap-2 mb-10">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === activeFeature
                      ? "w-8 opacity-100"
                      : "w-2 opacity-30"
                    }`}
                  style={{
                    background: i === activeFeature ? current.accent : "#94a3b8",
                  }}
                />
              ))}
            </div>

            {/* Feature cards grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                const isActive = i === activeFeature;
                return (
                  <motion.button
                    key={i}
                    onClick={() => setActiveFeature(i)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`text-left p-4 rounded-2xl border transition-all duration-300 ${isActive
                        ? "border-slate-200 bg-white shadow-md"
                        : "border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm"
                      }`}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${feat.bg} mb-2`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className={`text-xs font-semibold leading-tight ${isActive ? "text-slate-800" : "text-slate-500"}`}>
                      {feat.title}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>


        </div>
      </div>

      {/* ── RIGHT PANEL – Colorful gradient login form ── */}
      <div
        className="flex-1 lg:w-1/2 min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 w-full max-w-md mx-auto px-6 py-10"
        >

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="bg-white rounded-2xl p-2 shadow-lg">
              <img src={logo} alt="Matapang" className="h-9 w-auto" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Matapang</span>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8 xl:p-10 relative"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Colourful top accent bar */}
            <div
              className="absolute top-0 left-8 right-8 h-0.5 rounded-full"
              style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4, #f59e0b)" }}
            />

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Welcome back</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                Sign in to your enterprise workspace
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-5 flex items-start gap-3 rounded-xl p-3.5"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <span className="text-red-400 text-sm">⚠</span>
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Facility */}
            <form onSubmit={submit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-wider uppercase"
                  style={{ color: "rgba(255,255,255,0.5)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#RRGGBBAA]"
                    style={{width: 18, height: 18 }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 14,
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(124,58,237,0.7)";
                      e.target.style.background = "rgba(255,255,255,0.09)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(255,255,255,0.12)";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-wider uppercase"
                  style={{ color: "rgba(255,255,255,0.5)" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#RRGGBBAA]"
                    style={{width: 18, height: 18 }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 14,
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(124,58,237,0.7)";
                      e.target.style.background = "rgba(255,255,255,0.09)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(255,255,255,0.12)";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-[#RRGGBBAA]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full mt-2 py-4 rounded-xl font-bold text-sm tracking-wide relative overflow-hidden flex items-center justify-center gap-2 transition-all"
                style={{
                  background: loading
                    ? "rgba(124,58,237,0.5)"
                    : "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                  color: "white",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(124,58,237,0.4)",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {/* Shimmer effect */}
                {!loading && (
                  <motion.div
                    className="absolute inset-0 opacity-0 hover:opacity-100"
                    style={{
                      background: "linear-gradient(135deg, #9333ea 0%, #0e7490 100%)",
                    }}
                    animate={{}}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <ShieldCheck size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Secure enterprise authentication
                </span>
              </div>
              <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                Need help?{" "}
                <a href="mailto:support@matapang.com"
                  className="underline underline-offset-2 hover:text-white/50 transition-colors text-amber-50">
                  Contact your administrator
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}