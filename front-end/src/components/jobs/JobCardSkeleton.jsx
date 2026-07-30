import Skeleton from "../ui/Skeleton";

const JobCardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-3 w-1/2 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

export default JobCardSkeleton;
