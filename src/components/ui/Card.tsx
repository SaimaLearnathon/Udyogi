import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { staggerItem } from "../../config/motion";

interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={hover ? { y: -3, transition: { duration: 0.18 } } : undefined}
      className={`rounded-box border border-base-300 bg-base-100 shadow-sm ${hover ? "hover:border-primary/40 hover:shadow-md" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
