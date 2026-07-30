import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import ConfirmDialog from "../ui/ConfirmDialog";
import Spinner from "../ui/Spinner";
import SkillFormModal from "./SkillFormModal";
import { useCandidateSkillsQuery, useUpdateSkillMutation, useDetachSkillMutation } from "../../hooks/useCandidateSkills";
import { PROFICIENCY_LEVELS } from "../../constants/jobStatus";

const SkillsManager = () => {
  const { data, isLoading } = useCandidateSkillsQuery({ page: 1 });
  const skills = data?.data ?? [];
  const updateMutation = useUpdateSkillMutation();
  const detachMutation = useDetachSkillMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Skills</h2>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="text-sm text-primary-blue hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> Add skill
        </button>
      </div>

      {isLoading ? (
        <Spinner size={20} />
      ) : skills.length === 0 ? (
        <EmptyState title="No skills added yet" description="Add skills so your match score against jobs can be calculated." />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill.skill_id}
              className="flex items-center gap-2 border border-gray-200 dark:border-dark-box-outline rounded-full pl-3 pr-1 py-1 text-sm"
            >
              {skill.skill_name}
              <select
                aria-label={`Proficiency for ${skill.skill_name}`}
                value={skill.proficiency_level || "Intermediate"}
                onChange={(e) =>
                  updateMutation.mutate({ skillId: skill.skill_id, payload: { proficiency_level: e.target.value } })
                }
                className="text-xs bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setConfirmRemove(skill)}
                aria-label={`Remove ${skill.skill_name}`}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover text-error-red cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <SkillFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        alreadyAttachedIds={skills.map((s) => s.skill_id)}
      />

      <ConfirmDialog
        isOpen={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={async () => {
          if (!confirmRemove) return;
          await detachMutation.mutateAsync(confirmRemove.skill_id);
          setConfirmRemove(null);
        }}
        isPending={detachMutation.isPending}
        isDangerous
        title="Remove skill?"
        message={`"${confirmRemove?.skill_name}" will be removed from your profile.`}
        confirmLabel="Remove"
      />
    </section>
  );
};

export default SkillsManager;
