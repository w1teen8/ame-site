import { motion } from 'framer-motion'
import RollingText, { rollingTrigger } from '../header/RollingText'

const styles = {
  solid: 'bg-graphite text-milk hover:bg-[#2e2b28]',
  outline: 'border border-current text-current hover:bg-milk hover:text-graphite',
}

/** Sharp-cornered tracked-caps button with the rolling label. Renders a link when `href` is set. */
export default function Button({ href, variant = 'solid', className = '', children, ...rest }) {
  const Tag = href ? motion.a : motion.button
  return (
    <Tag
      href={href}
      type={href ? undefined : rest.type ?? 'button'}
      {...rollingTrigger}
      {...rest}
      className={`inline-flex h-11 shrink-0 items-center justify-center px-7 text-[11px] leading-[1.4] tracking-[0.18em] uppercase transition-colors duration-300 disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      <RollingText>{children}</RollingText>
    </Tag>
  )
}
