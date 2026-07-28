import Skeleton from "../ui/Skeleton";

const CompanyCardSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-32 w-full" />
    ))}
  </div>
);

export default CompanyCardSkeleton;
