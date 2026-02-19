import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { getAllPlans } from "../config/plans";
import CustomPlanModal from "../components/modals/CustomPlanModal";

// Sub-components
import { CompanyInfoForm } from "../components/companies/CompanyInfoForm";
import { PlantManager } from "../components/companies/PlantManager";
import { PlanSelector } from "../components/companies/PlanSelector";
import { AdminCredentialsForm } from "../components/companies/AdminCredentialsForm";

import CreateCompanyWizard from "../components/superAdmin/CreateCompanyWizard";

export default function CreateCompany() {
  return <CreateCompanyWizard />;
}
