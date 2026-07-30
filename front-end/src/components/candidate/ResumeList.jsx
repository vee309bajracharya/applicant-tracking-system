import { useState } from "react";
import { FileText, Download, Trash2, Star, Plus } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import ConfirmDialog from "../ui/ConfirmDialog";
import Spinner from "../ui/Spinner";
import ResumeUploadModal from "./ResumeUploadModal";
import { useResumesQuery, useDeleteResumeMutation, useDownloadResumeMutation } from "../../hooks/useResumes";

const ResumeList = () => {
  const { data, isLoading } = useResumesQuery({ page: 1 });
  const resumes = data?.data ?? [];
  const deleteMutation = useDeleteResumeMutation();
  const downloadMutation = useDownloadResumeMutation();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Resumes</h2>
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="text-sm text-primary-blue hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> Upload resume
        </button>
      </div>

      {isLoading ? (
        <Spinner size={20} />
      ) : resumes.length === 0 ? (
        <EmptyState title="No resumes uploaded yet" description="Upload a resume so recruiters can review it." />
      ) : (
        <ul className="flex flex-col gap-2">
          {resumes.map((resume) => (
            <li
              key={resume.id}
              className="flex items-center justify-between border border-gray-200 dark:border-dark-box-outline rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} className="text-gray-400 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{resume.file_name}</p>
                  {resume.is_primary && (
                    <span className="flex items-center gap-1 text-xs text-success-green">
                      <Star size={10} aria-hidden="true" /> Primary
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadMutation.mutate(resume)}
                  aria-label={`Download ${resume.file_name}`}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover cursor-pointer"
                >
                  <Download size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(resume)}
                  aria-label={`Delete ${resume.file_name}`}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-error-red cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ResumeUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

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
        title="Delete resume?"
        message={`"${confirmDelete?.file_name}" will be permanently removed.`}
        confirmLabel="Delete"
      />
    </section>
  );
};

export default ResumeList;
