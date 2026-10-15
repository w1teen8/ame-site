import { motion } from 'framer-motion'
import { EASE, transition } from '../../lib/motion'
import LangSwitch from './LangSwitch'
import RollingText, { rollingTrigger } from './RollingText'

const INSTAGRAM = 'https://www.instagram.com/ame.ukraine/'

const sheet = {
  closed: { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.7, ease: EASE, delay: 0.15 } },
  open: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.8, ease: EASE } },
}

const list = {
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
}

// Each line rises out of its own mask, like the Gownora menu.
const line = {
  closed: { y: '110%', transition: transition(0.45) },
  open: { y: '0%', transition: transition(0.9) },
}

const fade = {
  closed: { opacity: 0, transition: transition(0.3) },
  open: { opacity: 1, transition: transition(0.8, 0.6) },
}

/**
 * Full-screen menu for < xl. Rendered inside the fixed <header> at z -10, so
 * the bar (toggle, logo, bag) stays on top and doubles as the menu's header.
 */
export default function MobileMenu({ id, t, items, currentPath, lang, onLangChange, accountHref, onNavigate }) {
  return (
    <motion.div
      id={id}
      variants={sheet}
      initial="closed"
      animate="open"
      exit="closed"
      className="fixed inset-0 -z-10 flex flex-col overflow-y-auto bg-ecru px-4 pt-[112px] pb-8 text-graphite md:px-[30px]"
    >
      <nav aria-label={t.menu} className="flex-1">
        <motion.ul variants={list} className="flex flex-col gap-1 border-t border-graphite/10 pt-6">
          {items.map((item, i) => (
            <li key={item.href} className="overflow-hidden">
              <motion.div variants={line}>
                <motion.a
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={currentPath === item.href ? 'page' : undefined}
                  {...rollingTrigger}
                  className="group flex items-baseline gap-4 py-1.5"
                >
                  <span className="w-6 text-[10px] tracking-[0.2em] text-mist tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <RollingText className="font-display text-[clamp(2.5rem,10vw,4rem)] leading-[1.15]">
                    {item.label}
                  </RollingText>
                </motion.a>
              </motion.div>
            </li>
          ))}
        </motion.ul>
      </nav>

      <motion.div variants={fade} className="mt-12 flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-graphite/10 pt-6 text-[11px] tracking-[0.18em] uppercase">
          <LangSwitch lang={lang} onChange={onLangChange} label={t.language} />
          <div className="flex items-center gap-6">
            <a href={accountHref} onClick={onNavigate} className="transition-opacity hover:opacity-60">
              {t.account}
            </a>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-60"
            >
              Instagram
            </a>
          </div>
        </div>
        <p className="font-serif text-[22px] leading-snug text-taupe italic">{t.tagline}</p>
      </motion.div>
    </motion.div>
  )
}
