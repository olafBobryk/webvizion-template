"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const aspect = 844 / 236;

export default function Logo({
  href = "/",
  variant = "light",
  size = "md",
  className = "",
}: LogoProps) {
  const sizes = {
    sm: 24,
    md: 43,
    lg: 48,
  };

  return (
    <Link
      href={href}
      aria-label="Go to homepage"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <Image
        src={variant === "light" ? "/logo-light.svg" : "/logo-dark.svg"}
        alt="Brand logo"
        width={sizes[size] * aspect}
        height={sizes[size]}
        priority
      />
    </Link>
  );
}
