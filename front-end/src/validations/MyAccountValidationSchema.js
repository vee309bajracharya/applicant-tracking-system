import * as Yup from "yup";

const emptyToUndefined = (value, originalValue) =>
  typeof originalValue === "string" && originalValue.trim() === "" ? undefined : value;

export const MyAccountValidationSchema = Yup.object({
  fullname: Yup.string().trim().max(100).required("Full name is required"),
  email: Yup.string().trim().email("Enter a valid email").max(255).required("Email is required"),
  phone: Yup.string().trim().max(20).nullable(),
  current_password: Yup.string().when("password", {
    is: (val) => !!val,
    then: (schema) => schema.required("Enter your current password to set a new one"),
    otherwise: (schema) => schema.transform(emptyToUndefined).notRequired(),
  }),
  password: Yup.string()
    .transform(emptyToUndefined)
    .notRequired()
    .min(8, "At least 8 characters")
    .matches(/[a-z]/, "Include a lowercase letter")
    .matches(/[A-Z]/, "Include an uppercase letter")
    .matches(/[0-9]/, "Include a number")
    .matches(/[^a-zA-Z0-9]/, "Include a symbol"),
  password_confirmation: Yup.string().when("password", {
    is: (val) => !!val,
    then: (schema) => schema.oneOf([Yup.ref("password")], "Passwords must match").required("Confirm your new password"),
    otherwise: (schema) => schema.transform(emptyToUndefined).notRequired(),
  }),
});

export const MyAccountInitialValues = {
  fullname: "",
  email: "",
  phone: "",
  current_password: "",
  password: "",
  password_confirmation: "",
};
