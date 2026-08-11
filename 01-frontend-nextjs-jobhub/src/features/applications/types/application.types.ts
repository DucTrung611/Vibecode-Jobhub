export type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string | null;
  userId: number;
  userFullName: string | null;
  resumeUrl: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ApplyPayload {
  coverLetter?: string;
}
