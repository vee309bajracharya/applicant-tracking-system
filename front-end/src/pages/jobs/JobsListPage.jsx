import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import { useJobsQuery } from "../../hooks/useJobs";
import { useAuth } from "../../contexts/AuthContext";
import SearchBar from "../../components/ui/SearchBar";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import JobCard from "../../components/jobs/JobCard";
import JobCardSkeleton from "../../components/jobs/JobCardSkeleton";
import JobFormModal from "../../components/jobs/JobFormModal";
import { JOB_STATUS } from "../../constants/jobStatus";

const JobsListPage = () => {
  const { hasPermission, hasRole } = useAuth();
  const canCreate = hasPermission("jobs.create");
  const isCandidate = hasRole("candidate");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({ page, search: debouncedSearch || undefined, status: status || undefined }),
    [page, debouncedSearch, status]
  );

  const { data, isLoading } = useJobsQuery(queryParams);
  const jobs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <section>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{isCandidate ? "Open Positions" : "Job Requisitions"}</h1>
      </header>

      <section className="flex justify-between gap-3 mb-5">

        <div className="flex justify-between gap-3">

          <div className="mb-4 w-80">
            <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search jobs" />

          </div>
            <div>
              {!isCandidate && (
                <select
                  aria-label="Filter by status"
                  className="inputbox w-auto mb-4"
                  value={status}
                  onChange={(e) => { setPage(1); setStatus(e.target.value); }}
                >
                  <option value="">All status</option>
                  {Object.values(JOB_STATUS).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </div>

        </div>

        <div>
          <div className="flex items-center gap-3">
            {hasPermission("jobs.edit") && (
              <Link to="/jobs/archived" className="w-80 font-medium bg-primary-blue text-white py-2 rounded-lg hover:bg-secondary-blue transition-colors duration-200 cursor-pointer px-4">
                Archived Jobs
              </Link>
            )}
            {canCreate && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="auth-btn px-4 flex items-center gap-2"
              >
                <Plus size={16} /> New Job
              </button>
            )}
          </div>

        </div>
      </section>

      {isLoading ? (
        <JobCardSkeleton />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} showStatus={!isCandidate} />
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      {canCreate && <JobFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />}
    </section>
  );
};

export default JobsListPage;
