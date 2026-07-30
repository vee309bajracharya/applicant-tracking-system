import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { ResumeUploadValidationSchema, ResumeUploadInitialValues } from "../../validations/CandidateSkillValidationSchema";
import { useUploadResumeMutation } from "../../hooks/useResumes";

const ResumeUploadModal = ({ isOpen, onClose }) => {
  const uploadMutation = useUploadResumeMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ResumeUploadValidationSchema),
    defaultValues: ResumeUploadInitialValues,
  });

  useEffect(() => {
    if (isOpen) reset(ResumeUploadInitialValues);
  }, [isOpen, reset]);

  const onSubmit = async (values) => {
    try {
      await uploadMutation.mutateAsync(values);
      onClose();
    } catch (error) {
      console.error("Resume upload error:", error?.response?.data || error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload resume">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Resume upload form</legend>

          <div>
            <label htmlFor="resume" className="text-sm font-medium">
              File (PDF, DOC, DOCX — max 5MB) *
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="inputbox mt-1 p-1"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValue("resume", file, { shouldValidate: true });
              }}
            />
            <FormError message={errors.resume?.message} />
          </div>

          <div className="flex items-center gap-2">
            <input id="is_primary" type="checkbox" tabIndex={0} {...register("is_primary")} />
            <label htmlFor="is_primary" className="text-sm">
              Set as primary resume
            </label>
          </div>

          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {uploadMutation.isPending && <Spinner size={16} />}
            Upload
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default ResumeUploadModal;
