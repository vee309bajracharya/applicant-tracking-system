import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { SkillTaxonomyValidationSchema, SkillTaxonomyInitialValues } from "../../validations/SkillTaxonomyValidationSchema";
import { useCreateSkillMutation, useUpdateSkillTaxonomyMutation } from "../../hooks/useSkills";

const SkillTaxonomyFormModal = ({ isOpen, onClose, skill = null }) => {
  const isEditMode = !!skill;
  const createMutation = useCreateSkillMutation();
  const updateMutation = useUpdateSkillTaxonomyMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(SkillTaxonomyValidationSchema),
    defaultValues: SkillTaxonomyInitialValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(skill ? { skill_name: skill.skill_name } : SkillTaxonomyInitialValues);
  }, [isOpen, skill, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ skillId: skill.skill_id, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      console.error("Skill save error:", error?.response?.data || error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit skill" : "New skill"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Skill taxonomy form</legend>

          <div>
            <label htmlFor="skill_name" className="text-sm font-medium">
              Skill name *
            </label>
            <input id="skill_name" type="text" autoComplete="off" className="inputbox mt-1" {...register("skill_name")} />
            <FormError message={errors.skill_name?.message} />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending && <Spinner size={16} />}
            {isEditMode ? "Save changes" : "Create skill"}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default SkillTaxonomyFormModal;
