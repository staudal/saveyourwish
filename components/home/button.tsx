import Link from "next/link";
import clsx from "clsx";

type VariantStyles = {
  solid: { slate: string; blue: string; white: string };
  outline: { slate: string; white: string };
};

type ButtonColor = {
  solid: "slate" | "blue" | "white";
  outline: "slate" | "white";
};

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: keyof typeof baseStyles;
  color?: ButtonColor[keyof ButtonColor];
  href?: string;
}

const baseStyles = {
  solid:
    "group inline-flex items-center justify-center rounded-full py-2 px-4 text-base font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
  outline:
    "group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-base focus:outline-none",
} as const;

const variantStyles: VariantStyles = {
  solid: {
    slate:
      "bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900",
    blue: "bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600",
    white:
      "bg-white text-slate-900 hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white",
  },
  outline: {
    slate:
      "ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300",
    white:
      "ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white",
  },
} as const;

export function Button({
  variant = "solid",
  color = "slate",
  className,
  href,
  ...props
}: ButtonProps) {
  className = clsx(
    baseStyles[variant],
    variantStyles[variant][
      color as keyof (typeof variantStyles)[typeof variant]
    ],
    className
  );

  return href ? (
    <Link
      href={href}
      className={className}
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    />
  ) : (
    <button className={className} {...props} />
  );
}
