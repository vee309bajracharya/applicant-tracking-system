import { Link } from "react-router-dom";
import { Building2, Users, LayoutGrid } from "lucide-react";
import { buildStorageUrl } from "../../utils/buildStorageUrl";

const CompanyCard = ({ company }) => {
  const staffCount = company.users_count ?? company.staffs_count ?? company.users?.length ?? 0;
  const deptCount = company.departments_count ?? company.departments?.length ?? 0;

  return (
    <Link
      to={`/companies/${company.id}`}
      className="block border border-gray-200 dark:border-dark-box-outline rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        {company.logo ? (
          <img
            src={buildStorageUrl(company.logo)}
            alt={`${company.company_name} logo`}
            className="w-30 rounded-lg object-fill"
          />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-dark-hover flex items-center justify-center">
            <Building2 size={18} className="text-gray-400" aria-hidden="true" />
          </div>
        )}
      </div>
        <h3 className="font-semibold truncate text-xl mb-3">{company.company_name}</h3>

      {company.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {company.description}
        </p>
      )}

      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <LayoutGrid size={12} aria-hidden="true" /> {deptCount} departments
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} aria-hidden="true" /> {staffCount} staffs
        </span>
      </div>
    </Link>
  );
};

export default CompanyCard;