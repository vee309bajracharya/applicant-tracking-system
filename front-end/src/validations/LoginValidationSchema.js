import * as Yup from "yup";

export const LoginValidationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").max(255).required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});

export const LoginInitialValues = {
  email: "",
  password: "",
};
