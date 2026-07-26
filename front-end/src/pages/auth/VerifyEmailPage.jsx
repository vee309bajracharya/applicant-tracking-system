import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OtpValidationSchema, OtpInitialValues } from "../../validations/OtpValidationSchema";
import { useVerifyEmailMutation, useResendOtpMutation } from "../../hooks/useAuthMutations";
import Spinner from "../../components/ui/Spinner";
import FormError from "../../components/ui/FormError";
import MainLogo from "../../assets/images/atsLogo.webp";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(OtpValidationSchema),
    defaultValues: OtpInitialValues,
  });

  if (!email) {
    // No email in nav state means they landed here directly — nothing to verify against
    return (
      <section className="text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Start from registration or login to verify an email.
        </p>
        <Link to="/register" className="text-primary-blue font-medium">
          Go to registration
        </Link>
      </section>
    );
  }

  const onSubmit = async (values) => {
    await verifyMutation.mutateAsync({ email, otp: values.otp });
    navigate("/login", { replace: true });
  };

  return (
    <section className="main-style">
      <div className="text-center my-5">
        <img src={MainLogo} alt="logo" className="w-40 mx-auto" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-1">Verify your email</h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        We sent a 6-digit code to <span className="font-medium">{email}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">OTP verification form</legend>

          <div>
            <label htmlFor="otp" className="text-sm font-medium">
              OTP code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              aria-invalid={!!errors.otp}
              className="inputbox mt-1 tracking-widest text-center"
              {...register("otp")}
            />
            <FormError message={errors.otp?.message} />
          </div>

          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="auth-btn flex items-center justify-center gap-2"
          >
            Verify
            {verifyMutation.isPending && <Spinner size={16} />}
          </button>
        </fieldset>
      </form>

      <button
        type="button"
        onClick={() => resendMutation.mutate({ email })}
        disabled={resendMutation.isPending}
        className="text-md text-primary-blue mt-4 w-full text-center cursor-pointer"
      >
        {resendMutation.isPending ? "Resending..." : "Resend OTP"}
      </button>
    </section>
  );
};

export default VerifyEmailPage;
