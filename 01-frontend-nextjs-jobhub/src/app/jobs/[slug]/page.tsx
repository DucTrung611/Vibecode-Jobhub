import { JobDetailPage } from "@/features/jobs";
import { PublicShell } from "@/shared/components/public-shell";

export default async function JobDetail({ params }: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  return (
    <PublicShell>
      <JobDetailPage slug={slug} />
    </PublicShell>
  );
}
