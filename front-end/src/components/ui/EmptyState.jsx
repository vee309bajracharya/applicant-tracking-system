const EmptyState = ({ title = "Nothing here yet", description }) => (
  <div className="text-center py-16">
    <p className="font-medium">{title}</p>
    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
  </div>
);

export default EmptyState;
