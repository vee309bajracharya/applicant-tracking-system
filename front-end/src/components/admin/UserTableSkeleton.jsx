import Skeleton from "../ui/Skeleton";

const UserTableSkeleton = ({ rows = 6 }) => (
  <div className="flex flex-col gap-2" aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-14 w-full" />
    ))}
  </div>
);

export default UserTableSkeleton;
