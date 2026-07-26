import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { RegisterValidationSchema, RegisterInitialValues } from "../../validations/RegisterValidationSchema";
import { useRegisterMutation } from "../../hooks/useAuthMutations";
import Spinner from "../../components/ui/Spinner";
import FormError from "../../components/ui/FormError";
import GoogleOAuthButton from "../../components/auth/GoogleOAuthButton";
import MainLogo from "../../assets/images/atsLogo.webp";
import { Eye, EyeOff } from 'lucide-react';
import { useState } from "react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterValidationSchema),
    defaultValues: RegisterInitialValues,
  });

  const onSubmit = async (values) => {
    const payload = { fullname: values.fullname, email: values.email, password: values.password };
    const { data } = await registerMutation.mutateAsync(payload);
    navigate("/verify-email", { state: { email: data.data.email } });
  };

  return (
    <section className="main-style">
      <div className="text-center my-5">
        <img src={MainLogo} alt="logo" className="w-40 mx-auto" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-1">Create your account</h1>


      <div className="shadow-md p-4 rounded-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Registration form</legend>

            <div>
              <label htmlFor="fullname" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="fullname"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.fullname}
                className="inputbox mt-1"
                {...register("fullname")}
              />
              <FormError message={errors.fullname?.message} />
            </div>

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
              disabled={registerMutation.isPending}
              className="auth-btn flex items-center justify-center gap-2"
            >
              Register
              {registerMutation.isPending && <Spinner size={16} />}
            </button>
          </fieldset>
        </form>

      </div>
      <div className="flex items-center gap-3 my-6" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-200 dark:bg-dark-box-outline" />
        <span className="text-xs text-gray-400">OR</span>
        <span className="h-px flex-1 bg-gray-200 dark:bg-dark-box-outline" />
      </div>

      <GoogleOAuthButton text="Signup with Google" />

      <p className="text-center text-sm mt-6 text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-blue font-medium hover:text-secondary-blue">
          Log in
        </Link>
      </p>
    </section>
  );
};

export default RegisterPage;
