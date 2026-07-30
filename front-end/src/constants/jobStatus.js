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

export const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
