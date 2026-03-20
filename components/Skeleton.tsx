import { clsx } from "clsx";

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: Props) {
  return (
    <div
      className={clsx("animate-pulse rounded-lg", className)}
      style={{ backgroundColor: "var(--surface-2)", ...style }}
    />
  );
}
