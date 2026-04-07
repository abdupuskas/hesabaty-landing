'use client';

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from 'motion/react';
import { useEffect, useRef } from 'react';

type Props = {
  /** Final number to count to. */
  to: number;
  /** Animation duration in seconds. Default 1.6. */
  duration?: number;
  /** String to prepend (e.g. "EGP "). */
  prefix?: string;
  /** String to append (e.g. " ج.م"). */
  suffix?: string;
  /** Locale used for number formatting. Default "en-US". */
  locale?: string;
  /** Optional className for the wrapper. */
  className?: string;
};

/**
 * Counts a number up from 0 to `to` when it scrolls into view.
 * Falls back to a static value if the user prefers reduced motion.
 */
export function CountUp({
  to,
  duration = 1.6,
  prefix = '',
  suffix = '',
  locale = 'en-US',
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const reduce = useReducedMotion();

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return `${prefix}${Math.round(latest).toLocaleString(locale)}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      count.set(to);
      return;
    }
    const controls = animate(count, to, {
      duration,
      ease: [0.21, 0.47, 0.32, 0.98],
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration, count]);

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
}
