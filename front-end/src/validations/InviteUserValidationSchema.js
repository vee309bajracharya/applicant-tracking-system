import * as Yup from "yup";

export const InviteUserValidationSchema = Yup.object({
  fullname: Yup.string().max(100).required("Full name is required"),
  email: Yup.string().email("Enter a valid email").max(255).required("Email is required"),
  role: Yup.string().oneOf(["hr_manager", "recruiter"], "Choose a valid role").required("Role is required"),
  phone: Yup.string().max(15, "Max 15 characters").nullable(),
});

export const InviteUserInitialValues = {
  fullname: "",
  email: "",
  role: "recruiter",
  phone: "",
};
