const CustomLoader = ({ label = "Loading..." }) => {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center min-h-[40vh] gap-3"
    >
      <div className="h-10 w-10 border-4 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </section>
  );
};

export default CustomLoader;
