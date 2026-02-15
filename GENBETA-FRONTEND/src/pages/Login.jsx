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
  ChevronRight,
  Loader2,
  Building2,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Globe,
  Clock,
  Activity,
  BarChart3,
  HardHat,
  Factory,
  CheckCircle,
  Zap,
  Server,
} from "lucide-react";
import logo from "../assets/MatapanLogo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Factory,
      title: "Smart Facility Management",
      description: "AI-powered insights for optimal facility operations",
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: HardHat,
      title: "Workforce Coordination",
      description: "Real-time task allocation and progress tracking",
      color: "from-emerald-600 to-teal-600",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards with predictive metrics",
      color: "from-violet-600 to-purple-600",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance automation",
      color: "from-amber-600 to-orange-600",
    },
  ];

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
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
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Welcome back, {res.user.name}!</span>
          </div>
        );

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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Simple Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* LEFT PANEL - Brand & Features */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Simple Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
            {/* Logo */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-16"
            >
              <img
                src={logo}
                alt="Matapan Logo"
                className="h-12 w-auto object-contain"
              />
              <span className="text-3xl font-bold text-white">
                Matapang
              </span>
            </motion.div>

            {/* Dynamic Feature Showcase */}
            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${features[activeFeature].color} mb-6`}>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">Featured</span>
                  </div>

                  <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                    {features[activeFeature].title}
                  </h2>
                  
                  <p className="text-xl text-slate-300 mb-6 max-w-lg">
                    {features[activeFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Feature Navigation Dots */}
              <div className="flex gap-2 mb-12">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeFeature
                        ? "w-8 bg-white"
                        : "w-4 bg-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust Indicators - Simplified */}
            <div className="mt-auto pt-12">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm">SOC2 Type II</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">99.99% uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL - Login Form - Moved Higher */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-start justify-center p-4 lg:p-8 pt-16 lg:pt-24"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:hidden flex items-center justify-center gap-2 mb-8"
          >
            <img
              src={logo}
              alt="Matapan Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-slate-900">
              Matapang
            </span>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back
              </h1>
              <p className="text-slate-600">Sign in to your workspace</p>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={submit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition outline-none text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold flex justify-center items-center gap-2 transition-all mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Simple Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure enterprise authentication</span>
              </div>
            </div>
          </motion.div>

          {/* Support Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Need help? Contact your system administrator
          </p>
        </div>
      </motion.div>
    </div>
  );
}