import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth
import Login from "./pages/Login";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superAdmin/Dashboard";
import CompanyPage from "./pages/CompanyPage";
import CreateCompany from "./pages/CreateCompany";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import EditCompanyPage from "./pages/EditCompanyPage";
import AddPlantPage from "./pages/superAdmin/AddPlantPage";

// Company Admin Pages
import CompanyAdminDashboard from "./pages/companyAdmin/Dashboard";
import PlantList from "./pages/companyAdmin/PlantList";
import CreatePlant from "./pages/companyAdmin/CreatePlant";
import EditPlantPage from "./pages/companyAdmin/EditPlantPage";
import CompanyProfile from "./pages/companyAdmin/Profile";
import PlansPage from "./pages/companyAdmin/PlansPage";

import PlantAssignments from "./pages/plantAdmin/Assignments";
import EmployeeAssignments from "./pages/employee/Assignments";

// Plant Admin Pages
import PlantAdminDashboard from "./pages/plantAdmin/Dashboard";
import FormsList from "./pages/plantAdmin/FormsList";
import FormBuilderPage from "./pages/plantAdmin/FormBuilderPage";
import TemplateSelectionPage from "./pages/plantAdmin/TemplateSelectionPage";
import PlantSubmissions from "./pages/plantAdmin/Submissions";
import SubmissionDetails from "./pages/plantAdmin/SubmissionDetails";
import Employees from "./pages/plantAdmin/Employees";
import AddEmployee from "./pages/plantAdmin/AddEmployee";
import PlantProfile from "./pages/plantAdmin/Profile";

// New separate forms pages
import ActiveFormsPage from "./pages/plantAdmin/ActiveFormsPage";
import DraftFormsPage from "./pages/plantAdmin/DraftFormsPage";
import ArchivedFormsPage from "./pages/plantAdmin/ArchivedFormsPage";
import SavedTemplatesPage from "./pages/plantAdmin/SavedTemplatesPage";

// Employee Pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeTemplates from "./pages/employee/Templates";
import FillFormPage from "./pages/employee/FillFormPage";
import BulkApprovalPage from "./pages/approval/BulkApprovalPage";
import PendingApprovals from "./pages/approval/PendingApprovals";
import ApprovalDetail from "./pages/approval/ApprovalDetail";
import Profile from "./pages/Profile";
import FormsCardView from "./pages/FormsCardView";
import EmployeeSubmissions from "./pages/employee/Submissions";
import EmployeeSubmissionDetails from "./pages/employee/SubmissionDetails";
import EditSubmission from "./pages/employee/EditSubmission";

// Public Pages
import ApprovalPage from "./pages/public/ApprovalPage";
import SubmittedSuccess from "./pages/public/SubmittedSuccess";

function getDefaultRoute(role) {
  switch (role) {
    case "SUPER_ADMIN": return "/super/dashboard";
    case "COMPANY_ADMIN": return "/company/dashboard";
    case "PLANT_ADMIN": return "/plant/dashboard";
    case "EMPLOYEE": return "/employee/dashboard";
    default: return "/login";
  }
}

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute(user?.role)} /> : <Login />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute(user?.role)} />} />
        
        {/* Public Approval Pages */}
        <Route path="/approve/:token" element={<ApprovalPage />} />
        <Route path="/submitted" element={<SubmittedSuccess />} />

        {/* Super Admin Routes */}
        <Route path="/super" element={<ProtectedRoute roles={["SUPER_ADMIN"]}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="companies" element={<CompanyPage />} />
          <Route path="companies/create" element={<CreateCompany />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="companies/:id/edit" element={<EditCompanyPage />} />
          <Route path="companies/:id/plants/add" element={<AddPlantPage />} />
        </Route>

        {/* Company Admin Routes */}
        <Route path="/company" element={<ProtectedRoute roles={["COMPANY_ADMIN"]}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<CompanyAdminDashboard />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="plants" element={<PlantList />} />
          <Route path="plants/create" element={<CreatePlant />} />
          <Route path="plants/:plantId/edit" element={<EditPlantPage />} />
        </Route>

        {/* Plant Admin Routes */}
        <Route path="/plant" element={<ProtectedRoute roles={["PLANT_ADMIN"]}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<PlantAdminDashboard />} />
          <Route path="profile" element={<PlantProfile />} />
          <Route path="forms-view" element={<FormsCardView />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="forms" element={<FormsList />} />
          <Route path="forms/active" element={<ActiveFormsPage />} />
          <Route path="forms/draft" element={<DraftFormsPage />} />
          <Route path="forms/archived" element={<ArchivedFormsPage />} />
          <Route path="forms/templates" element={<SavedTemplatesPage />} />
          <Route path="assignments" element={<PlantAssignments />} />
          <Route path="forms/create/select" element={<TemplateSelectionPage />} />
          <Route path="forms/create" element={<FormBuilderPage />} />
          <Route path="forms/create/:view" element={<FormBuilderPage />} />
          <Route path="forms/:id/edit" element={<FormBuilderPage />} />
          <Route path="forms/:id/edit/:view" element={<FormBuilderPage />} />
          <Route path="submissions" element={<PlantSubmissions />} />
          <Route path="submissions/:id" element={<SubmissionDetails />} />
          <Route path="approval/pending" element={<PendingApprovals />} />
          <Route path="approval/detail/:id" element={<ApprovalDetail />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<ProtectedRoute roles={["EMPLOYEE"]}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="forms-view" element={<FormsCardView />} />
          <Route path="templates" element={<EmployeeTemplates />} />
          <Route path="assignments" element={<EmployeeAssignments />} />
          <Route index element={<EmployeeDashboard />} />
          <Route path="fill-form/:taskId" element={<FillFormPage />} />
          <Route path="fill-assignment/:assignmentId" element={<FillFormPage />} />
          <Route path="fill-template/:formId" element={<FillFormPage />} />
          <Route path="bulk-approval/:taskId" element={<BulkApprovalPage />} />
          <Route path="submissions" element={<EmployeeSubmissions />} />
          <Route path="submissions/:id" element={<EmployeeSubmissionDetails />} />
          <Route path="submissions/:id/edit" element={<EditSubmission />} />
          <Route path="approval/pending" element={<PendingApprovals />} />
          <Route path="approval/detail/:id" element={<ApprovalDetail />} />
        </Route>

        {/* Profile Route (Shared) */}
        <Route element={<ProtectedRoute roles={["SUPER_ADMIN", "COMPANY_ADMIN", "PLANT_ADMIN", "EMPLOYEE"]}><MainLayout /></ProtectedRoute>}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;