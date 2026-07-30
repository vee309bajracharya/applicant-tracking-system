import * as Yup from "yup";

export const SkillTaxonomyValidationSchema = Yup.object({
  skill_name: Yup.string().trim().max(100).required("Skill name is required"),
});

export const SkillTaxonomyInitialValues = { skill_name: "" };
