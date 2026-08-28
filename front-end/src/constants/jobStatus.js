export const JOB_STATUS = Object.freeze({
  OPEN: "open",
  CLOSED: "closed",
  DRAFT: "draft",
});

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.OPEN]: "Open",
  [JOB_STATUS.CLOSED]: "Closed",
  [JOB_STATUS.DRAFT]: "Draft",
};

export const JOB_STATUS_BADGE_CLASSES = {
  [JOB_STATUS.OPEN]: "bg-success-green/10 text-success-green",
  [JOB_STATUS.CLOSED]: "bg-error-red/10 text-error-red",
  [JOB_STATUS.DRAFT]: "bg-warning-orange/10 text-warning-orange",
};

export const EXPIRING_SOON_KEY = "expiring_soon";

export const getJobDisplayStatus = (job) => {
  if (job?.is_expiring_soon) return EXPIRING_SOON_KEY;
  return job?.status;
};

export const JOB_DISPLAY_STATUS_LABELS = {
  ...JOB_STATUS_LABELS,
  [EXPIRING_SOON_KEY]: "Expiring Soon",
};

export const JOB_DISPLAY_STATUS_BADGE_CLASSES = {
  ...JOB_STATUS_BADGE_CLASSES,
  [EXPIRING_SOON_KEY]: "bg-warning-orange/10 text-warning-orange",
};

export const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
