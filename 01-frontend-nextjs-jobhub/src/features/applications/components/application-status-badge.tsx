import { StatusBadge } from "@/shared/components/status-badge";
import type { ApplicationStatus } from "../types/application.types";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  return <StatusBadge status={status} kind="application" />;
}
