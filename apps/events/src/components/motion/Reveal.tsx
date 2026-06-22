import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const variants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
  className?: string;
  margin?: string;
}

export const Reveal = ({
  children,
  delay = 0,
  duration = 0.9,
  as = 'div',
  className,
  margin = '-80px',
}: RevealProps) => {
  const MotionTag = motion[as];
  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={variants}
      transition={{ delay, duration, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  );
};
