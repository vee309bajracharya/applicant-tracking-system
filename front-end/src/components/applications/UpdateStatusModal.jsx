import { useState } from "react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import { APPLICATION_STATUS_LABELS } from "../../constants/applicationStatus";
import { useUpdateApplicationStatusMutation } from "../../hooks/useApplications";

const NEXT_STATUS_MAP = {
  applied: ["screening"],
  screening: ["shortlisted", "rejected"],
  shortlisted: ["interview", "rejected"],
  interview: ["selected", "rejected"],
  selected: ["hired", "rejected"],
  hired: [],
  rejected: [],
};

const UpdateStatusModal = ({ isOpen, onClose, application, hasPermission }) => {
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const updateMutation = useUpdateApplicationStatusMutation();

  if (!application) return null;

  const finalOutcomes = ["selected", "rejected", "hired"];
  const options = (NEXT_STATUS_MAP[application.status] || []).filter((next) =>
    finalOutcomes.includes(next) ? hasPermission("hiring.manage") : hasPermission("applications.screen")
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!status) return;
    try {
      await updateMutation.mutateAsync({ applicationId: application.id, payload: { status, reason: reason || undefined } });
      setStatus("");
      setReason("");
      onClose();
    } catch (error) {
      console.error("Status update error:", error?.response?.data || error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update application status">
      {options.length === 0 ? (
        <p className="text-sm text-gray-400">
          {application.status === "hired" || application.status === "rejected"
            ? "This application has reached a final state."
            : "You don't hold the permission required for the next transition on this application."}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Status update form</legend>

            <div>
              <label htmlFor="status" className="text-sm font-medium">
                New status *
              </label>
              <select
                id="status"
                className="inputbox mt-1"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="">Select next status</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {APPLICATION_STATUS_LABELS[opt]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="text-sm font-medium">
                Reason <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <textarea
                id="reason"
                rows={3}
                maxLength={255}
                className="inputbox mt-1"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending || !status}
              className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {updateMutation.isPending && <Spinner size={16} />}
              Update status
            </button>
          </fieldset>
        </form>
      )}
    </Modal>
  );
};

export default UpdateStatusModal;
