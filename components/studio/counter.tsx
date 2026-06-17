"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 0.9,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => {
    const n = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
    const withCommas = Number(n).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${withCommas}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
