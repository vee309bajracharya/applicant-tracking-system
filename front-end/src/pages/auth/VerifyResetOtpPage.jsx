import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, useNavigate } from "react-router-dom";
import { OtpValidationSchema, OtpInitialValues } from "../../validations/OtpValidationSchema";
import { useVerifyResetOtpMutation, useForgotPasswordMutation } from "../../hooks/useAuthMutations";
import Spinner from "../../components/ui/Spinner";
import FormError from "../../components/ui/FormError";
import MainLogo from "../../assets/images/atsLogo.webp";

const VerifyResetOtpPage = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("ats_pw_reset_email");

  const verifyMutation = useVerifyResetOtpMutation();
  const resendMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(OtpValidationSchema),
    defaultValues: OtpInitialValues,
  });

  if (!email) return <Navigate to="/forgot-password" replace />;

  const onSubmit = async (values) => {
    const { data } = await verifyMutation.mutateAsync({ email, otp: values.otp });
    sessionStorage.setItem("ats_pw_reset_token", data.data.reset_token);
    navigate("/reset-password");
  };

  return (
    <section className="main-style">
      <div className="text-center my-5">
        <img src={MainLogo} alt="logo" className="w-40 mx-auto" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-1">Enter Reset Code</h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        Sent to <span className="font-medium">{email}</span>
      </p>

      <div className="shadow-md p-6 rounded-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Reset OTP form</legend>

            <div>
              <label htmlFor="otp" className="text-md font-semibold">
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
              Verify code
              {verifyMutation.isPending && <Spinner size={16} />}
            </button>
          </fieldset>
        </form>

      </div>


      <button
        type="button"
        onClick={() => resendMutation.mutate({ email })}
        disabled={resendMutation.isPending}
        className="text-sm text-primary-blue font-medium mt-4 w-full text-center cursor-pointer hover:text-secondary-blue"
      >
        {resendMutation.isPending ? "Resending..." : "Resend code"}
      </button>
    </section>
  );
};

export default VerifyResetOtpPage;
