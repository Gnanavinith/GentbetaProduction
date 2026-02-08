import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  MapPin, 
  Users, 
  Layout,
  ChevronRight,
  Download,
  MoreVertical,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Globe
} from "lucide-react";

// Components
import { DeleteCompanyModal } from "../components/companies/DeleteCompanyModal";
import CompanyListContainer from "../components/superAdmin/CompanyListContainer";

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <CompanyListContainer />
    </div>
  );
}

const getPlanBadge = (plan) => {
  const planKey = plan?.toUpperCase() || "SILVER";
  switch(planKey) {
    case "GOLD":
      return { icon: "🥇", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
    case "PREMIUM":
      return { icon: "💎", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" };
    default:
      return { icon: "🥈", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
  }
};
