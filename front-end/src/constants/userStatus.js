export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
});

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: "Active",
  [USER_STATUS.INACTIVE]: "Inactive",
  [USER_STATUS.SUSPENDED]: "Suspended",
  [USER_STATUS.PENDING]: "Pending",
};

export const USER_STATUS_BADGE_CLASSES = {
  [USER_STATUS.ACTIVE]: "bg-success-green/10 text-success-green",
  [USER_STATUS.INACTIVE]: "bg-gray-200 text-gray-600 dark:bg-dark-hover dark:text-gray-300",
  [USER_STATUS.SUSPENDED]: "bg-error-red/10 text-error-red",
  [USER_STATUS.PENDING]: "bg-warning-orange/10 text-warning-orange",
};
