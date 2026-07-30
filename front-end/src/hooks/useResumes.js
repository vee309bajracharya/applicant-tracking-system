import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import resumeService from "../services/resumeService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useResumesQuery = (params) =>
  useQuery({
    queryKey: ["candidate", "resumes", params],
    queryFn: async () => {
      const { data } = await resumeService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });

export const useUploadResumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.store,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Resume uploaded");
      queryClient.invalidateQueries({ queryKey: ["candidate", "resumes"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDeleteResumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.destroy,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Resume deleted");
      queryClient.invalidateQueries({ queryKey: ["candidate", "resumes"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDownloadResumeMutation = () =>
  useMutation({
    mutationFn: async (resume) => {
      const response = await resumeService.download(resume.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = resume.file_name || "resume";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
