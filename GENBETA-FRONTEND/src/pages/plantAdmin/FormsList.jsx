import { useState, useEffect } from "react";
import { Plus, Search, FileText, Trash2, Edit, Check, Users, Copy, Archive, RefreshCw, Download, Loader2, Table } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { formApi } from "../../api/form.api";
import { useAuth } from "../../context/AuthContext";
import { templateApi } from "../../api/template.api";
import { assignmentApi } from "../../api/assignment.api";
import { submissionApi } from "../../api/submission.api";
import api from "../../api/api";
import { exportToExcel, formatSubmissionsForExport, formatTemplateForExport } from "../../utils/excelExport";
import { logError } from "../../utils/errorHandler";
import ApproverSelectionModal from "../../components/modals/ApproverSelectionModal";
import { Modal, Input } from "../../components/modals/Modal";
import { ActionBar } from "../../components/common/ActionBar";

export default function FormsList() {
  const navigate = useNavigate();
  
  // Redirect to the active forms page by default
  useEffect(() => {
    navigate("/plant/forms/active");
  }, [navigate]);
  
  return null; // This component will redirect immediately
}
