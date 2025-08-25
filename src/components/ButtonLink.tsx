"use client";

import Link from "next/link";
import { type AnchorHTMLAttributes, forwardRef, type ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full no-underline select-none " +
  "transition-[transform,box-shadow,background-color,border-color] active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 px-5 py-[15px]";

const sizeStyles: Record<Size, string> = {
  sm: " ",
  md: " ",
  lg: " ",
};

const variantStyles: Record<Variant, string> = {
  solid:
    "bg-white text-black shadow-sm border border-white/15 hover:bg-white/90",
  outline:
    "bg-transparent text-white border border-white/25 hover:border-white/40",
  ghost: "bg-transparent text-white hover:bg-white/10",
};

type CommonProps = {
  href: string;
  children?: ReactNode;
  label?: string; // optional aria-label override
  className?: string;
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  prefetch?: boolean;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
};

const ButtonLink = forwardRef<HTMLAnchorElement, CommonProps>(
  (
    {
      href,
      children,
      label,
      className,
      variant = "solid",
      size = "md",
      leadingIcon,
      trailingIcon,
      prefetch,
      target,
      rel,
    },
    ref,
  ) => {
    const isExternal =
      /^https?:\/\//i.test(href) ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");

    const content = (
      <>
        {leadingIcon}
        <span className="capitalize leading-none">{children}</span>
        {trailingIcon}
      </>
    );

    const classes = cx(
      base,
      sizeStyles[size],
      variantStyles[variant],
      className,
    );

    if (isExternal) {
      const safeRel = target === "_blank" ? "noopener noreferrer" : undefined;
      return (
        <a
          ref={ref}
          href={href}
          target={target}
          rel={rel ?? safeRel}
          aria-label={label}
          className={classes}
        >
          {content}
        </a>
      );
    }

    // Internal link (Next.js)
    return (
      <Link
        ref={ref}
        href={href}
        prefetch={prefetch}
        aria-label={label}
        className={classes}
      >
        {content}
      </Link>
    );
  },
);

ButtonLink.displayName = "ButtonLink";

export default ButtonLink;
