import Modal from "./Modal";
import Spinner from "./Spinner";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  isDangerous = false,
  isPending = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-box-outline hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isPending}
        className={`px-4 py-2 text-sm rounded-lg text-white flex items-center gap-2 cursor-pointer ${
          isDangerous ? "bg-error-red hover:bg-error-red/90" : "bg-primary-blue hover:bg-secondary-blue"
        }`}
      >
        {isPending && <Spinner size={14} />}
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
