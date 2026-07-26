import * as Yup from "yup";

export const ForgotPasswordValidationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").max(255).required("Email is required"),
});

export const ForgotPasswordInitialValues = { email: "" };
