const PALETTE = ["bg-void", "bg-meridian", "bg-signal", "bg-momentum"];

function colorFor(name: string): string {
  const sum = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

interface InitialsAvatarProps {
  name: string;
  size?: number;
}

export function InitialsAvatar({ name, size = 40 }: InitialsAvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display text-white ${colorFor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initialsFor(name)}
    </span>
  );
}
