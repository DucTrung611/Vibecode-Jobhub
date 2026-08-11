import { Suspense } from "react";
import { JobSearchPage } from "@/features/jobs";
import { PublicShell } from "@/shared/components/public-shell";

export default function Jobs() {
  return (
    <PublicShell>
      <Suspense fallback={null}>
        <JobSearchPage />
      </Suspense>
    </PublicShell>
  );
}
