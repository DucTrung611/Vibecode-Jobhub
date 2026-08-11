export function formatSalary(min: string | null, max: string | null): string {
  const fmt = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  };
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return "Salary not disclosed";
}

export function formatEmploymentType(type: string): string {
  return type
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
