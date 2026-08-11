// Kept as local literal unions (not imported from features/jobs|applications)
// so this shared component carries no feature-specific knowledge and can't
// form a circular import with feature barrels — values mirror
// DATABASE.md's `jobs.status` / `applications.status` enums exactly.
type JobStatus = "draft" | "pending_review" | "published" | "closed" | "rejected";
type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";

type BadgeTone = "draft" | "open" | "closed" | "pending" | "reviewing";

const JOB_STATUS_TONE: Record<JobStatus, BadgeTone> = {
  draft: "draft",
  pending_review: "pending",
  published: "open",
  closed: "closed",
  rejected: "closed",
};

const APPLICATION_STATUS_TONE: Record<ApplicationStatus, BadgeTone> = {
  pending: "pending",
  reviewed: "reviewing",
  shortlisted: "open",
  rejected: "closed",
  accepted: "open",
};

const TONE_LABEL: Record<BadgeTone, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  pending: "Pending",
  reviewing: "Reviewing",
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  draft: "bg-status-draft-bg text-status-draft-fg",
  open: "bg-status-open-bg text-status-open-fg",
  closed: "bg-status-closed-bg text-status-closed-fg",
  pending: "bg-status-pending-bg text-status-pending-fg",
  reviewing: "bg-status-reviewing-bg text-status-reviewing-fg",
};

const STATUS_LABEL_OVERRIDE: Partial<Record<JobStatus | ApplicationStatus, string>> = {
  pending_review: "Pending Review",
};

interface StatusBadgeProps {
  status: JobStatus | ApplicationStatus;
  kind: "job" | "application";
  className?: string;
}

export function StatusBadge({ status, kind, className = "" }: StatusBadgeProps) {
  const tone =
    kind === "job"
      ? JOB_STATUS_TONE[status as JobStatus]
      : APPLICATION_STATUS_TONE[status as ApplicationStatus];
  const label = STATUS_LABEL_OVERRIDE[status] ?? TONE_LABEL[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
