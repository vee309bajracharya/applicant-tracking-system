import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import { useFaqsQuery, useDeleteFaqMutation } from "../../hooks/useFaqs";
import SearchBar from "../../components/ui/SearchBar";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Skeleton from "../../components/ui/Skeleton";
import FaqFormModal from "../../components/admin/FaqFormModal";

const FaqAdminPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const queryParams = useMemo(() => ({ page, search: debouncedSearch || undefined }), [page, debouncedSearch]);
  const { data, isLoading } = useFaqsQuery(queryParams);
  const faqs = data?.data ?? [];
  const meta = data?.meta;
  const deleteMutation = useDeleteFaqMutation();

  return (
    <section>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <button
          type="button"
          onClick={() => {
            setEditingFaq(null);
            setIsFormOpen(true);
          }}
          className="auth-btn w-auto px-4 flex items-center gap-2"
        >
          <Plus size={16} /> New FAQ
        </button>
      </header>

      <div className="w-80 mb-4">
        <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search FAQs" />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <EmptyState title="No FAQs found" description="Create the first entry the chatbot can answer from." />
      ) : (
        <ul className="flex flex-col gap-2">
          {faqs.map((faq) => (
            <li key={faq.id} className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{faq.question}</p>
                    {!faq.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-hover text-gray-500">
                        Inactive
                      </span>
                    )}
                    {faq.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-blue/10 text-secondary-blue">
                        {faq.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq(faq);
                      setIsFormOpen(true);
                    }}
                    aria-label={`Edit ${faq.question}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(faq)}
                    aria-label={`Delete ${faq.question}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-error-red cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <FaqFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} faq={editingFaq} />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteMutation.mutateAsync(confirmDelete.id);
          setConfirmDelete(null);
        }}
        isPending={deleteMutation.isPending}
        isDangerous
        title="Delete this FAQ?"
        message={`"${confirmDelete?.question}" will be removed from the chatbot's knowledge base.`}
        confirmLabel="Delete"
      />
    </section>
  );
};

export default FaqAdminPage;
