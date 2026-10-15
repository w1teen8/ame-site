import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { dict } from '../../lib/i18n'
import { transition } from '../../lib/motion'
import { CloseIcon } from '../header/icons'

const UaFlag = () => (
  <span className="flex h-[14px] w-[20px] flex-col overflow-hidden">
    <span className="flex-1 bg-[#0057B7]" />
    <span className="flex-1 bg-[#FFD700]" />
  </span>
)

const Globe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-graphite">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </svg>
)

function Option({ index, title, note, meta, flag, chip, onClick, autoFocus }) {
  const ref = useRef(null)
  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="group relative flex min-h-[176px] flex-col items-start border border-graphite/15 p-5 text-left transition-colors duration-300 hover:border-graphite hover:bg-milk focus-visible:border-graphite focus-visible:outline-none md:p-6"
    >
      <span className="flex w-full items-center justify-between text-[10px] tracking-[0.2em] text-mist">
        {String(index).padStart(2, '0')}
        {chip && (
          <span className="border border-graphite/20 px-2 py-0.5 tracking-[0.16em] text-taupe uppercase">{chip}</span>
        )}
      </span>
      <span className="mt-5 block" aria-hidden="true">
        {flag}
      </span>
      <span className="mt-3 font-display text-[30px] leading-none text-graphite md:text-[34px]">{title}</span>
      <span className="mt-2 text-[13px] leading-snug text-taupe">{note}</span>
      <span className="mt-auto pt-4 text-[9px] tracking-[0.2em] text-mist uppercase">{meta}</span>
    </button>
  )
}

/**
 * First-visit "Where do we ship?" chooser. Ukraine keeps the Ukrainian site,
 * Worldwide switches to English. Escape or the cross keeps the current choice.
 */
export default function RegionModal({ lang, onChoose, onClose }) {
  const t = dict[lang].region
  const ua = dict.ua.region
  const en = dict.en.region

  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition(0.5)}
      className="fixed inset-0 z-[70] grid place-items-center bg-graphite/45 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="region-title"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={transition(0.8, 0.1)}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[640px] bg-ecru p-6 text-graphite md:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-3 right-3 grid size-10 place-items-center transition-opacity hover:opacity-60"
        >
          <CloseIcon />
        </button>

        <p className="font-wordmark text-[22px] tracking-[0.42em] uppercase">Âme</p>
        <h2 id="region-title" className="mt-6 font-display text-[34px] leading-none md:text-[44px]">
          {t.title}
        </h2>
        <p className="mt-2 font-serif text-[15px] text-mist italic">{t.subtitle}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Option
            index={1}
            flag={<UaFlag />}
            title={ua.ukraine}
            note={ua.ukraineNote}
            meta={ua.ukraineMeta}
            chip={t.yours}
            onClick={() => onChoose('ua')}
            autoFocus
          />
          <Option
            index={2}
            flag={<Globe />}
            title={en.world}
            note={en.worldNote}
            meta={en.worldMeta}
            onClick={() => onChoose('en')}
          />
        </div>

        <p className="mt-6 text-[9px] tracking-[0.18em] text-mist uppercase">{t.hint}</p>
      </motion.div>
    </motion.div>
  )
}
