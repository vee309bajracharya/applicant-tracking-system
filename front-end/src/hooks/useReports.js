import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import reportService from "../services/reportService";

const resolveErrorMessage = async (error) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed?.message || "Could not generate the report. Please try again.";
    } catch {
      return "Could not generate the report. Please try again.";
    }
  }
  return data?.message || "Could not generate the report. Please try again.";
};

const triggerBrowserDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const useExportReportMutation = (report) =>
  useMutation({
    mutationFn: () => reportService[report](),
    onSuccess: (response) => {
      const date = new Date().toISOString().slice(0, 10);
      triggerBrowserDownload(response.data, `${report}-report-${date}.pdf`);
      toast.success("Report downloaded");
    },
    onError: async (error) => toast.error(await resolveErrorMessage(error)),
  });
