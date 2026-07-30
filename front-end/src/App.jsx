import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import CustomLoader from "./components/common/CustomLoader";
import ErrorPage from "./pages/ErrorPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleProtectedRoute from "./components/common/RoleProtectedRoute";
import GuestLayout from "./layouts/GuestLayout";
import MainLayout from "./layouts/MainLayout";
import { ROLES } from "./constants/roles";

const Home = lazy(() => import("./pages/Home"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const VerifyResetOtpPage = lazy(() => import("./pages/auth/VerifyResetOtpPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const OAuthCallbackPage = lazy(() => import("./pages/auth/OAuthCallbackPage"));
const SetPasswordPage = lazy(() => import("./pages/auth/SetPasswordPage"));
const UserManagementPage = lazy(() => import("./pages/admin/UserManagementPage"));
const CompaniesListPage = lazy(() => import("./pages/companies/CompaniesListPage"));
const CompanyDetailPage = lazy(() => import("./pages/companies/CompanyDetailPage"));

const JobsListPage = lazy(() => import("./pages/jobs/JobsListPage"));
const JobDetailPage = lazy(() => import("./pages/jobs/JobDetailPage"));
const ArchivedJobsPage = lazy(() => import("./pages/jobs/ArchivedJobsPage"));
const SkillsAdminPage = lazy(() => import("./pages/admin/SkillsAdminPage"));
const CandidateProfilePage = lazy(() => import("./pages/candidate/CandidateProfilePage"));
const MyApplicationsPage = lazy(() => import("./pages/candidate/MyApplicationsPage"));
const ApplicationsQueuePage = lazy(() => import("./pages/applications/ApplicationsQueuePage"));
const ApplicationDetailPage = lazy(() => import("./pages/applications/ApplicationDetailPage"));

const withSuspense = (el) => <Suspense fallback={<CustomLoader />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    element: <GuestLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/login", element: withSuspense(<LoginPage />) },
      { path: "/register", element: withSuspense(<RegisterPage />) },
      { path: "/verify-email", element: withSuspense(<VerifyEmailPage />) },
      { path: "/forgot-password", element: withSuspense(<ForgotPasswordPage />) },
      { path: "/reset-password/verify", element: withSuspense(<VerifyResetOtpPage />) },
      { path: "/reset-password", element: withSuspense(<ResetPasswordPage />) },
      { path: "/set-password", element: withSuspense(<SetPasswordPage />) },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: withSuspense(<Home />) },

          // Jobs — visible to every authenticated role (all roles hold jobs.view)
          { path: "/jobs", element: withSuspense(<JobsListPage />) },
          { path: "/jobs/:jobId", element: withSuspense(<JobDetailPage />) },

          {
            element: <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.RECRUITER]} />,
            children: [{ path: "/jobs/archived", element: withSuspense(<ArchivedJobsPage />) }],
          },

          {
            element: <RoleProtectedRoute allowedRoles={[ROLES.CANDIDATE]} />,
            children: [
              { path: "/candidate/profile", element: withSuspense(<CandidateProfilePage />) },
              { path: "/candidate/applications", element: withSuspense(<MyApplicationsPage />) },
            ],
          },

          {
            element: <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.RECRUITER]} />,
            children: [
              { path: "/applications", element: withSuspense(<ApplicationsQueuePage />) },
              { path: "/applications/:applicationId", element: withSuspense(<ApplicationDetailPage />) },
            ],
          },

          {
            element: <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [
              { path: "/admin/users", element: withSuspense(<UserManagementPage />) },
              { path: "/admin/skills", element: withSuspense(<SkillsAdminPage />) },
              { path: "/companies", element: withSuspense(<CompaniesListPage />) },
              { path: "/companies/:companyId", element: withSuspense(<CompanyDetailPage />) },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/oauth/callback",
    element: withSuspense(<OAuthCallbackPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/unauthorized",
    element: withSuspense(<Unauthorized />),
    errorElement: <ErrorPage />,
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
