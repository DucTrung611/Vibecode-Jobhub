"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/auth.context";
import { CheckIcon } from "@/shared/components/icons";
import { useApply } from "../hooks/use-apply";

interface ApplyButtonProps {
  jobId: number;
}

/**
 * Handles the two known failure modes surfaced by API_SPEC.md §7 inline
 * rather than a toast-only/crash: no resume on file (400 VALIDATION_001)
 * and already applied (409 APPLICATIONS_002).
 */
export function ApplyButton({ jobId }: ApplyButtonProps) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { submit, isLoading, error } = useApply();
  const [coverLetter, setCoverLetter] = useState("");
  const [applied, setApplied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleApply() {
    const result = await submit(jobId, { coverLetter: coverLetter || undefined });
    if (result) {
      setApplied(true);
      setShowForm(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="w-full rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white"
      >
        Sign in to apply
      </button>
    );
  }

  if (applied) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-status-open-bg px-6 py-3 text-sm font-semibold text-status-open-fg">
        <CheckIcon className="h-4 w-4" />
        Application submitted
      </div>
    );
  }

  const isAlreadyApplied = error?.code === "APPLICATIONS_002";
  const needsResume = error?.code === "VALIDATION_001";

  return (
    <div className="flex flex-col gap-3">
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white"
        >
          Apply now
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Cover letter (optional)"
            rows={4}
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleApply()}
              className="flex-1 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? "Submitting..." : "Submit application"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-mist px-6 py-3 text-sm font-semibold text-text-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isAlreadyApplied && (
        <p className="text-sm text-status-pending-fg">You&apos;ve already applied to this job.</p>
      )}
      {needsResume && (
        <p className="text-sm text-[#D6394B]">
          Upload a resume in your profile before applying to a job.
        </p>
      )}
      {error && !isAlreadyApplied && !needsResume && (
        <p className="text-sm text-[#D6394B]">{error.message}</p>
      )}
    </div>
  );
}
