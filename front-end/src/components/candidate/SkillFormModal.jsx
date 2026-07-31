import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { CandidateSkillValidationSchema, CandidateSkillInitialValues } from "../../validations/CandidateSkillValidationSchema";
import { useSkillsQuery } from "../../hooks/useSkills";
import { useAttachSkillMutation } from "../../hooks/useCandidateSkills";
import { PROFICIENCY_LEVELS } from "../../constants/jobStatus";

const SkillFormModal = ({ isOpen, onClose, alreadyAttachedIds = [] }) => {
  const { data: skillsData } = useSkillsQuery({ page: 1 }, { enabled: isOpen });
  const attachMutation = useAttachSkillMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CandidateSkillValidationSchema),
    defaultValues: CandidateSkillInitialValues,
  });

  useEffect(() => {
    if (isOpen) reset(CandidateSkillInitialValues);
  }, [isOpen, reset]);

  const availableSkills = (skillsData?.data ?? []).filter((s) => !alreadyAttachedIds.includes(s.skill_id));

  const onSubmit = async (values) => {
    try {
      await attachMutation.mutateAsync({ skill_id: Number(values.skill_id), proficiency_level: values.proficiency_level });
      onClose();
    } catch (error) {
      console.error("Attach skill error:", error?.response?.data || error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a skill">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Attach skill form</legend>

          {!availableSkills.length && (
            <p className="text-xs text-gray-400">
              No skills found to add.
            </p>
          )}

          <div>
            <label htmlFor="skill_id" className="text-sm font-medium">
              Skill *
            </label>
            <select id="skill_id" className="inputbox mt-1" {...register("skill_id")}>
              <option value="">Select a skill</option>
              {availableSkills.map((s) => (
                <option key={s.skill_id} value={s.skill_id}>
                  {s.skill_name}
                </option>
              ))}
            </select>
            <FormError message={errors.skill_id?.message} />
          </div>

          <div>
            <label htmlFor="proficiency_level" className="text-sm font-medium">
              Proficiency *
            </label>
            <select id="proficiency_level" className="inputbox mt-1" {...register("proficiency_level")}>
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <FormError message={errors.proficiency_level?.message} />
          </div>

          <button
            type="submit"
            disabled={attachMutation.isPending || !availableSkills.length}
            className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {attachMutation.isPending && <Spinner size={16} />}
            Add skill
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default SkillFormModal;
