import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { FaqValidationSchema, FaqInitialValues } from "../../validations/FaqValidationSchema";
import { useCreateFaqMutation, useUpdateFaqMutation } from "../../hooks/useFaqs";

const FaqFormModal = ({ isOpen, onClose, faq = null }) => {
  const isEditMode = !!faq;
  const createMutation = useCreateFaqMutation();
  const updateMutation = useUpdateFaqMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FaqValidationSchema),
    defaultValues: FaqInitialValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      faq
        ? { question: faq.question, answer: faq.answer, category: faq.category || "", is_active: faq.is_active }
        : FaqInitialValues
    );
  }, [isOpen, faq, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, category: values.category || null };
      if (isEditMode) {
        await updateMutation.mutateAsync({ faqId: faq.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error("FAQ save error:", error?.response?.data || error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit FAQ" : "New FAQ"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">FAQ entry form</legend>

          <div>
            <label htmlFor="question" className="text-sm font-medium">
              Question *
            </label>
            <input id="question" type="text" autoComplete="off" className="inputbox mt-1" {...register("question")} />
            <FormError message={errors.question?.message} />
          </div>

          <div>
            <label htmlFor="answer" className="text-sm font-medium">
              Answer *
            </label>
            <textarea id="answer" rows={4} className="inputbox mt-1" {...register("answer")} />
            <FormError message={errors.answer?.message} />
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <input id="category" type="text" autoComplete="off" className="inputbox mt-1" {...register("category")} />
            <FormError message={errors.category?.message} />
          </div>

          <div className="flex items-center gap-2">
            <input id="is_active" type="checkbox" tabIndex={0} {...register("is_active")} />
            <label htmlFor="is_active" className="text-sm">
              Active (visible to the chatbot &amp; FAQ list)
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending && <Spinner size={16} />}
            {isEditMode ? "Save changes" : "Create FAQ"}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default FaqFormModal;
