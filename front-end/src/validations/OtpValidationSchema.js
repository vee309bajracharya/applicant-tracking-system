import * as Yup from "yup";

export const OtpValidationSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
    .required("OTP is required"),
});

export const OtpInitialValues = { otp: "" };
