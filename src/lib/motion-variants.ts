import { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.35 } 
  }
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { 
    transition: { staggerChildren: 0.1 } 
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 200, damping: 20 } 
  }
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.3 } }
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.3 } }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

export const glowPulse: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 2.5,
      repeat: Infinity
    }
  }
};

export const breathingOrb: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 15,
      repeat: Infinity,
      repeatType: "mirror"
    }
  }
};

// Signature motion: drawing the constellation thread
export const threadDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { 
      pathLength: { duration: 1.2, ease: "easeInOut" },
      opacity: { duration: 0.2 } 
    } 
  }
};
