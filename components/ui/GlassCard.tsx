import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div className={`glass-card hover-lift rounded-xl p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
