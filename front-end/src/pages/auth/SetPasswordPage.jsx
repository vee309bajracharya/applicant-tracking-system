import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  ResetPasswordValidationSchema,
  ResetPasswordInitialValues,
} from "../../validations/ResetPasswordValidationSchema";
import { useState } from "react";
import { useSetPasswordMutation } from "../../hooks/useAuthMutations";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff } from 'lucide-react';
import Spinner from "../../components/ui/Spinner";
import FormError from "../../components/ui/FormError";
import MainLogo from "../../assets/images/atsLogo.webp";

// lands here from the invite email link:

const SetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token");
  const { persistSession } = useAuth();
  const setPasswordMutation = useSetPasswordMutation();
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

  if (!inviteToken) return <Navigate to="/login" replace />;

  const onSubmit = async (values) => {
    const { data } = await setPasswordMutation.mutateAsync({
      invite_token: inviteToken,
      ...values,
    });
    const { token, user } = data.data;
    persistSession(token, user);
    navigate("/", { replace: true });
  };

  return (
    <section className="main-style">
      <div className="text-center my-5">
        <img src={MainLogo} alt="logo" className="w-40 mx-auto" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-1">Set your Password</h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        Finish setting up your invited account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Set password form</legend>

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
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
              Confirm Password
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
            disabled={setPasswordMutation.isPending}
            className="auth-btn flex items-center justify-center gap-2"
          >
            {setPasswordMutation.isPending && <Spinner size={16} />}
            Activate account
          </button>
        </fieldset>
      </form>
    </section>
  );
};

export default SetPasswordPage;
