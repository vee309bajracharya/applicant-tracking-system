import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ResetPasswordValidationSchema,
  ResetPasswordInitialValues,
} from "../../validations/ResetPasswordValidationSchema";
import { useResetPasswordMutation } from "../../hooks/useAuthMutations";
import Spinner from "../../components/ui/Spinner";
import FormError from "../../components/ui/FormError";
import MainLogo from "../../assets/images/atsLogo.webp";
import { Eye, EyeOff } from 'lucide-react';
import { useState } from "react";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("ats_pw_reset_email");
  const resetToken = sessionStorage.getItem("ats_pw_reset_token");
  const resetMutation = useResetPasswordMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ResetPasswordValidationSchema),
    defaultValues: ResetPasswordInitialValues,
  });

  if (!email || !resetToken) return <Navigate to="/forgot-password" replace />;

  const onSubmit = async (values) => {
    await resetMutation.mutateAsync({
      email,
      reset_token: resetToken,
      ...values,
    });
    // new form -> new data: wipe the transient flow state after success
    sessionStorage.removeItem("ats_pw_reset_email");
    sessionStorage.removeItem("ats_pw_reset_token");
    navigate("/login", { replace: true });
  };

  return (
    <section className="main-style">
      <div className="text-center my-5">
        <img src={MainLogo} alt="logo" className="w-40 mx-auto" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-1">Set a New Password</h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose a strong password for {email}
      </p>

      <div className="shadow-md p-4 rounded-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Reset password form</legend>

            <div>
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className="inputbox pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormError message={errors.password?.message} />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password_confirmation}
                  className="inputbox pr-10"
                  {...register("password_confirmation")}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormError message={errors.password_confirmation?.message} />
            </div>

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="auth-btn flex items-center justify-center gap-2"
            >
              Reset Password
              {resetMutation.isPending && <Spinner size={16} />}
            </button>
          </fieldset>
        </form>

      </div>

    </section>
  );
};

export default ResetPasswordPage;
