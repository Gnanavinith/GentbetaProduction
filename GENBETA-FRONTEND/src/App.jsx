import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy-loaded components
const Login = lazy(() => import("./pages/Login"));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import("./pages/superAdmin/Dashboard"));
const CompanyPage = lazy(() => import("./pages/CompanyPage"));
const CreateCompany = lazy(() => import("./pages/CreateCompany"));
const CompanyDetailPage = lazy(() => import("./pages/CompanyDetailPage"));
const EditCompanyPage = lazy(() => import("./pages/EditCompanyPage"));
const AddPlantPage = lazy(() => import("./pages/superAdmin/AddPlantPage"));

// Company Admin Pages
const CompanyAdminDashboard = lazy(() => import("./pages/companyAdmin/Dashboard"));
const PlantList = lazy(() => import("./pages/companyAdmin/PlantList"));
const CreatePlant = lazy(() => import("./pages/companyAdmin/CreatePlant"));
const EditPlantPage = lazy(() => import("./pages/companyAdmin/EditPlantPage"));
const CompanyProfile = lazy(() => import("./pages/companyAdmin/Profile"));
const PlansPage = lazy(() => import("./pages/companyAdmin/PlansPage"));

const PlantAssignments = lazy(() => import("./pages/plantAdmin/Assignments"));
const EmployeeAssignments = lazy(() => import("./pages/employee/Assignments"));

// Plant Admin Pages
const PlantAdminDashboard = lazy(() => import("./pages/plantAdmin/Dashboard"));
const FacilitysList = lazy(() => import("./pages/plantAdmin/FacilitysList"));
const FacilityBuilderPage = lazy(() => import("./pages/plantAdmin/FacilityBuilderPage"));
const TemplateSelectionPage = lazy(() => import("./pages/plantAdmin/TemplateSelectionPage"));
const PlantSubmissions = lazy(() => import("./pages/plantAdmin/Submissions"));
const SubmissionDetails = lazy(() => import("./pages/plantAdmin/SubmissionDetails"));
const Employees = lazy(() => import("./pages/plantAdmin/Employees"));
const AddEmployee = lazy(() => import("./pages/plantAdmin/AddEmployee"));
const PlantProfile = lazy(() => import("./pages/plantAdmin/Profile"));

// New separate forms pages
const ActiveFacilitysPage = lazy(() => import("./pages/plantAdmin/ActiveFacilitysPage"));
const DraftFacilitysPage = lazy(() => import("./pages/plantAdmin/DraftFacilitysPage"));
const ArchivedFacilitysPage = lazy(() => import("./pages/plantAdmin/ArchivedFacilitysPage"));
const SavedTemplatesPage = lazy(() => import("./pages/plantAdmin/SavedTemplatesPage"));

// Employee Pages
const EmployeeDashboard = lazy(() => import("./pages/employee/Dashboard"));
const EmployeeTemplates = lazy(() => import("./pages/employee/Templates"));
const FillFacilityPage = lazy(() => import("./pages/employee/FillFacilityPage"));
const BulkApprovalPage = lazy(() => import("./pages/approval/BulkApprovalPage"));
const PendingApprovals = lazy(() => import("./pages/approval/PendingApprovals"));
const ApprovalDetail = lazy(() => import("./pages/approval/ApprovalDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const FacilitysCardView = lazy(() => import("./pages/FacilitysCardView"));
const EmployeeSubmissions = lazy(() => import("./pages/employee/Submissions"));
const EmployeeSubmissionDetails = lazy(() => import("./pages/employee/SubmissionDetails"));
const EditSubmission = lazy(() => import("./pages/employee/EditSubmission"));

// Public Pages
const ApprovalPage = lazy(() => import("./pages/public/ApprovalPage"));
const SubmittedSuccess = lazy(() => import("./pages/public/SubmittedSuccess"));



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
      <Suspense fallback={<LoadingSpinner />}>
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
          <Route path="forms-view" element={<FacilitysCardView />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="forms" element={<FacilitysList />} />
          <Route path="forms/active" element={<ActiveFacilitysPage />} />
          <Route path="forms/draft" element={<DraftFacilitysPage />} />
          <Route path="forms/archived" element={<ArchivedFacilitysPage />} />
          <Route path="forms/templates" element={<SavedTemplatesPage />} />
          <Route path="assignments" element={<PlantAssignments />} />
          <Route path="forms/create/select" element={<TemplateSelectionPage />} />
          <Route path="forms/create" element={<FacilityBuilderPage />} />
          <Route path="forms/create/:view" element={<FacilityBuilderPage />} />
          <Route path="forms/:id/edit" element={<FacilityBuilderPage />} />
          <Route path="forms/:id/edit/:view" element={<FacilityBuilderPage />} />
          <Route path="submissions" element={<PlantSubmissions />} />
          <Route path="submissions/:id" element={<SubmissionDetails />} />
          <Route path="approval/pending" element={<PendingApprovals />} />
          <Route path="approval/detail/:id" element={<ApprovalDetail />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<ProtectedRoute roles={["EMPLOYEE"]}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="forms-view" element={<FacilitysCardView />} />
          <Route path="templates" element={<EmployeeTemplates />} />
          <Route path="assignments" element={<EmployeeAssignments />} />
          <Route index element={<EmployeeDashboard />} />
          <Route path="fill-form/:taskId" element={<FillFacilityPage />} />
          <Route path="fill-assignment/:assignmentId" element={<FillFacilityPage />} />
          <Route path="fill-template/:formId" element={<FillFacilityPage />} />
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
    </Suspense>
    </BrowserRouter>
  );
}

export default App;