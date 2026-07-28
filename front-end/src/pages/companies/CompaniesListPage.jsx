import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import { useCompaniesQuery } from "../../hooks/useCompanies";
import SearchBar from "../../components/ui/SearchBar";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import CompanyCard from "../../components/companies/CompanyCard";
import CompanyCardSkeleton from "../../components/companies/CompanyCardSkeleton";
import CompanyFormModal from "../../components/companies/CompanyFormModal";

const CompaniesListPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({ page, search: debouncedSearch || undefined }),
    [page, debouncedSearch]
  );

  const { data, isLoading } = useCompaniesQuery(queryParams);
  const companies = data?.data ?? [];
  const meta = data?.meta;

  return (
    <section>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
        </div>
      </header>

      <div className="flex justify-between">
        <div className="mb-4 w-80">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search Companies" />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="auth-btn w-auto px-4 flex items-center gap-2"
          >
            <Plus size={16} /> New company
          </button>
        </div>

      </div>


      {isLoading ? (
        <CompanyCardSkeleton />
      ) : companies.length === 0 ? (
        <EmptyState title="No companies yet" description="Create your first company to get started." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <CompanyFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
};

export default CompaniesListPage;
