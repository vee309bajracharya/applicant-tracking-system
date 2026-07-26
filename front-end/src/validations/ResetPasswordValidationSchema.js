import * as Yup from "yup";

const PASSWORD_RULE = Yup.string()
  .min(8, "At least 8 characters")
  .matches(/[a-z]/, "Needs a lowercase letter")
  .matches(/[A-Z]/, "Needs an uppercase letter")
  .matches(/[0-9]/, "Needs a number")
  .matches(/[^A-Za-z0-9]/, "Needs a symbol")
  .required("Password is required");

export const ResetPasswordValidationSchema = Yup.object({
  password: PASSWORD_RULE,
  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export const ResetPasswordInitialValues = {
  password: "",
  password_confirmation: "",
};
