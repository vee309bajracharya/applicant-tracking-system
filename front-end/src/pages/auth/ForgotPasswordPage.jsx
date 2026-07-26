import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import {
  ForgotPasswordValidationSchema,
  ForgotPasswordInitialValues,
} from "../../validations/ForgotPasswordValidationSchema";
import { useForgotPasswordMutation } from "../../hooks/useAuthMutations";
import Spinner from "../../components/ui/Spinner";
import FormError from "../../components/ui/FormError";
import MainLogo from "../../assets/images/atsLogo.webp";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const forgotMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ForgotPasswordValidationSchema),
    defaultValues: ForgotPasswordInitialValues,
  });

  const onSubmit = async (values) => {
    await forgotMutation.mutateAsync(values);
    sessionStorage.setItem("ats_pw_reset_email", values.email);
    navigate("/reset-password/verify");
  };

  return (
    <section className="main-style">
      <div className="text-center my-5">
        <img src={MainLogo} alt="logo" className="w-40 mx-auto" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-1">Forgot Password</h1>
      <p className="text-center text-md text-gray-500 dark:text-gray-400 mb-6">
        Enter your email and we'll send you a reset code
      </p>

      <div className="shadow-md p-6 rounded-md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Forgot password form</legend>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="inputbox mt-1"
              {...register("email")}
            />
            <FormError message={errors.email?.message} />
          </div>

          <button
            type="submit"
            disabled={forgotMutation.isPending}
            className="auth-btn flex items-center justify-center gap-2"
          >
            {forgotMutation.isPending && <Spinner size={16} />}
            Send Reset Code
          </button>
        </fieldset>
      </form>

      </div>


      <p className="text-center text-sm mt-6 text-gray-500 dark:text-gray-400">
        <Link to="/login" className="text-primary-blue font-medium hover:text-secondary-blue">
          Back to Login
        </Link>
      </p>
    </section>
  );
};

export default ForgotPasswordPage;
