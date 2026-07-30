import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import { useSkillsQuery, useDeleteSkillMutation } from "../../hooks/useSkills";
import SearchBar from "../../components/ui/SearchBar";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Skeleton from "../../components/ui/Skeleton";
import SkillTaxonomyFormModal from "../../components/admin/SkillTaxonomyFormModal";

const SkillsAdminPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const queryParams = useMemo(
    () => ({ page, search: debouncedSearch || undefined }),
    [page, debouncedSearch]
  );

  const { data, isLoading } = useSkillsQuery(queryParams);
  const skills = data?.data ?? [];
  const meta = data?.meta;
  const deleteMutation = useDeleteSkillMutation();

  return (
    <section>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Add Job Skills</h1>
      </header>

      <div className="flex justify-between gap-3 mb-5">
        <div className="mb-4 w-80">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search Job Skills"
          className="w-full border border-box-outline rounded-lg px-8 py-2 focus:outline-none" />
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSkill(null);
            setIsFormOpen(true);
          }}
          className="w-40 px-2 flex items-center gap-2 font-medium bg-primary-blue text-white py-2 rounded-lg hover:bg-secondary-blue transition-colors duration-200 cursor-pointer"
        >
          <Plus size={16} /> New skill
        </button>

      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <EmptyState title="No skills found" description="Create the first entry in the skill taxonomy." />
      ) : (
        <ul className="grid grid-cols-3 gap-6">
          {skills.map((skill) => (
            <li
              key={skill.skill_id}
              className="flex items-center justify-between border border-gray-200 dark:border-dark-box-outline rounded-lg px-4 py-2.5"
            >
              <span className="text-sm font-medium">{skill.skill_name}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSkill(skill);
                    setIsFormOpen(true);
                  }}
                  aria-label={`Edit ${skill.skill_name}`}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(skill)}
                  aria-label={`Delete ${skill.skill_name}`}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-error-red cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <SkillTaxonomyFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} skill={editingSkill} />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteMutation.mutateAsync(confirmDelete.skill_id);
          setConfirmDelete(null);
        }}
        isPending={deleteMutation.isPending}
        isDangerous
        title="Delete skill?"
        message={`"${confirmDelete?.skill_name}" will be removed from the taxonomy. Candidates/jobs already referencing it may be affected.`}
        confirmLabel="Delete"
      />
    </section>
  );
};

export default SkillsAdminPage;
