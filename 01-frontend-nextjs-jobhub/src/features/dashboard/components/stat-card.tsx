import { NotchedCard } from "@/shared/components/notched-card";

interface StatCardProps {
  label: string;
  value: number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <NotchedCard className="rounded-[14px] border border-mist p-6">
      <p className="mb-2 text-sm font-medium text-text-secondary">{label}</p>
      <p className="font-mono text-3xl font-semibold text-void">{value.toLocaleString()}</p>
    </NotchedCard>
  );
}
