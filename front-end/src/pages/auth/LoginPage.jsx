import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoginValidationSchema, LoginInitialValues } from "../../validations/LoginValidationSchema";
import { useLoginMutation } from "../../hooks/useAuthMutations";
import Spinner from "../../components/ui/Spinner";
import FormError from "../../components/ui/FormError";
import GoogleOAuthButton from "../../components/auth/GoogleOAuthButton";
import { Eye, EyeOff } from "lucide-react";
import MainLogo from "../../assets/images/atsLogo.webp";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  // OAuthController::callback() redirects failures with ?oauth_error=...
  useEffect(() => {
    const oauthError = searchParams.get("oauth_error");
    if (oauthError) {
      toast.error(oauthError);
      searchParams.delete("oauth_error");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginValidationSchema),
    defaultValues: LoginInitialValues,
  });

  const onSubmit = async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // 403, candidate needs to verify email first
      if (error?.response?.data?.data?.requires_verification) {
        navigate("/verify-email", { state: { email: values.email } });
      }
    }
  };

  return (
    <section className="main-style">

      <div className="text-center my-5">
        <img src={MainLogo} alt="logo" className="w-40 mx-auto" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-1">Welcome back</h1>
      <p className="text-center text-md font-medium text-gray-500 dark:text-gray-400 mb-6">
        Log in to get started
      </p>

      <div className="shadow-md p-6 rounded-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Login form</legend>

            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="off"
                aria-invalid={!!errors.email}
                className="inputbox mt-1"
                {...register("email")}
              />
              <FormError message={errors.email?.message} />
            </div>

            <div>
              <div className="float-right">
                <Link to="/forgot-password" className="text-xs text-primary-blue font-semibold hover:text-secondary-blue">
                  Forgot Password?
                </Link>
              </div>
              <div className="mt-4">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
              </div>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className="inputbox pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <FormError message={errors.password?.message} />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="auth-btn flex items-center justify-center gap-2"
            >
              Log in
              {loginMutation.isPending && <Spinner size={16} />}
            </button>
          </fieldset>
        </form>


      </div>
        <div className="flex items-center gap-3 my-6" aria-hidden="true">
          <span className="h-px flex-1 bg-gray-200 dark:bg-dark-box-outline" />
          <span className="text-xs text-gray-400">OR</span>
          <span className="h-px flex-1 bg-gray-200 dark:bg-dark-box-outline" />
        </div>

        <GoogleOAuthButton text="Continue with Google" />
      <p className="text-center text-sm mt-6 text-gray-500 dark:text-gray-400">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary-blue font-medium hover:text-secondary-blue">
          Register
        </Link>
      </p>

    </section>
  );
};

export default LoginPage;
