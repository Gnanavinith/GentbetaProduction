import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Input, Section } from "../components/modals/Modal";
import { Upload, X, ArrowLeft, Save, Building2, Briefcase, Phone, Mail, MapPin, FileText, Shield } from "lucide-react";
import LogoSection from "../components/company/LogoSection";
import BasicDetailsSection from "../components/company/BasicDetailsSection";
import ContactDetailsSection from "../components/company/ContactDetailsSection";
import ComplianceAddressSection from "../components/company/ComplianceAddressSection";
import DividerSection from "../components/company/DividerSection";
import EditCompanyContainer from "../components/superAdmin/EditCompanyContainer";

export default function EditCompanyPage() {
  return <EditCompanyContainer />;
}
