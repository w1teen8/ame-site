import { motion } from 'framer-motion'
import { transition } from '../../lib/motion'

const top = { rest: { y: '0%' }, hover: { y: '-105%' } }
const bottom = { rest: { y: '105%' }, hover: { y: '0%' } }

/**
 * Text that rolls up to reveal a copy of itself — the hover signature of the
 * Gownora header. Must sit inside a motion parent that switches between the
 * "rest" and "hover" variants.
 */
export default function RollingText({ children, className = '' }) {
  return (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      <motion.span className="block" variants={top} transition={transition(0.55)}>
        {children}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 block"
        variants={bottom}
        transition={transition(0.55)}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** Props that put a motion element into rest/hover mode for RollingText children. */
export const rollingTrigger = {
  initial: 'rest',
  animate: 'rest',
  whileHover: 'hover',
  whileFocus: 'hover',
}
