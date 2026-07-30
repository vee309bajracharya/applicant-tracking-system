import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useTrashedJobsQuery, useRestoreJobMutation } from "../../hooks/useJobs";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/ui/Skeleton";

const ArchivedJobsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTrashedJobsQuery({ page });
  const jobs = data?.data ?? [];
  const meta = data?.meta;
  const restoreMutation = useRestoreJobMutation();

  return (
    <section>
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-blue mb-4"
      >
        <ArrowLeft size={14} /> Back to jobs
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold">Archived jobs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Restoring brings a job back as a Draft — reopen it from the job's edit form when it's ready for candidates
          again.
        </p>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState title="No archived jobs" description="Jobs you archive will show up here." />
      ) : (
        <ul className="flex flex-col gap-2">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center justify-between border border-gray-200 dark:border-dark-box-outline rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {job.company?.company_name} {job.department?.name ? `· ${job.department.name}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => restoreMutation.mutate(job.id)}
                disabled={restoreMutation.isPending}
                className="text-sm text-primary-blue hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={14} /> Restore
              </button>
            </li>
          ))}
        </ul>
      )}

      <Pagination meta={meta} onPageChange={setPage} />
    </section>
  );
};

export default ArchivedJobsPage;
