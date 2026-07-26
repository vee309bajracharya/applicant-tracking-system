import { Link } from "react-router-dom";

const Unauthorized = () => (
  <section className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
    <h1 className="text-4xl font-bold text-error-red">403</h1>
    <p className="text-gray-500 dark:text-gray-400">
      You don't have permission to view this page.
    </p>
    <Link to="/" className="auth-btn">
      Back to Home
    </Link>
  </section>
);

export default Unauthorized;
