import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import CustomLoader from "./components/common/CustomLoader";
import ErrorPage from "./pages/ErrorPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import GuestLayout from "./layouts/GuestLayout";
import MainLayout from "./layouts/MainLayout";

const Home = lazy(() => import("./pages/Home"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const VerifyResetOtpPage = lazy(() => import("./pages/auth/VerifyResetOtpPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const OAuthCallbackPage = lazy(() => import("./pages/auth/OAuthCallbackPage"));

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
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <MainLayout />,
        children: [{ path: "/", element: withSuspense(<Home />) }],
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
