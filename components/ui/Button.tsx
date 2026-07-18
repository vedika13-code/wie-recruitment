import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "glass";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "btn-primary-glow text-white",
  secondary: "glass-card text-white",
  glass: "glass-card text-white",
};

const BASE_CLASSES =
  "inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition duration-300";

// Link-style button, for navigation/CTAs (e.g. "Apply Now").
type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
  variant?: Variant;
};

export function LinkButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

// Plain <button>, for form submits and actions (e.g. "Save Profile").
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
