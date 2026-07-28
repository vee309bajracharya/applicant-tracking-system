export const buildStorageUrl = (relativePath) => {
  if (!relativePath) return null;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const origin = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${origin}/storage/${relativePath}`;
};
