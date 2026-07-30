import * as Yup from "yup";

export const CandidateSkillValidationSchema = Yup.object({
  skill_id: Yup.number().typeError("Select a skill").required("Skill is required"),
  proficiency_level: Yup.string()
    .oneOf(["Beginner", "Intermediate", "Advanced"], "Choose a valid level")
    .required("Proficiency level is required"),
});

export const CandidateSkillInitialValues = {
  skill_id: "",
  proficiency_level: "Intermediate",
};

export const ResumeUploadValidationSchema = Yup.object({
  resume: Yup.mixed()
    .required("Select a resume file")
    .test("fileType", "Only PDF, DOC or DOCX allowed", (file) =>
      !file
        ? false
        : [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(file.type)
    )
    .test("fileSize", "Max file size is 5MB", (file) => !file || file.size <= 5 * 1024 * 1024),
  is_primary: Yup.boolean().default(false),
});

export const ResumeUploadInitialValues = { resume: null, is_primary: false };
