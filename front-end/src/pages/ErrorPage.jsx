import { useNavigate, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const status = error?.status ?? 500;
  const message =
    status === 404
      ? "Page not found."
      : error?.statusText || error?.message || "Something went wrong.";

  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-6xl font-bold text-primary-blue">{status}</h1>
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="auth-btn"
      >
        Back to Home
      </button>
    </section>
  );
};

export default ErrorPage;
