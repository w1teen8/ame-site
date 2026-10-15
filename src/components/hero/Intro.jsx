import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { EASE } from '../../lib/motion'
import { useHeroMedia } from '../../lib/useMedia'

// Lines around the video window, Gownora-style: capitals with italic words.
// Each entry is [text, italic?].
const LINES = {
  ua: {
    before: [[['Жіночність,', false]], [['що', true], ['створена', false]]],
    after: [[['вручну', false]], [['для', true], ['тебе.', true]]],
  },
  en: {
    before: [[['Femininity,', false]], [['that is', true], ['made', false]]],
    after: [[['by hand', false]], [['for', true], ['you.', true]]],
  },
}

const LOAD_MS = 2600 // minimum time the counter takes to reach 100%
const MAX_WAIT_MS = 7000 // never hold the page longer than this for the video

const wordVariants = {
  hidden: { color: 'rgba(26,26,26,0.08)', filter: 'blur(6px)', y: 10 },
  shown: (i) => ({
    color: 'rgba(26,26,26,1)',
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 1.1, ease: EASE, delay: 0.25 + i * 0.13 },
  }),
  leave: { opacity: 0, filter: 'blur(6px)', y: -8, transition: { duration: 0.5, ease: EASE } },
}

function Line({ words, start }) {
  return (
    <span className="block">
      {words.map(([text, italic], j) => (
        <motion.span
          key={text}
          custom={start + j}
          variants={wordVariants}
          className={`inline-block px-[0.12em] ${italic ? 'font-serif normal-case italic' : 'uppercase'}`}
        >
          {text}
        </motion.span>
      ))}
    </span>
  )
}

/**
 * Opening sequence: words resolve from pale to ink around a small playing
 * video window, a hairline counter runs to 100%, then the window grows to
 * fill the screen and hands over to the hero underneath.
 */
export default function Intro({ lang = 'ua', desktop, mobile, onDone }) {
  const media = useHeroMedia(desktop, mobile)
  const [phase, setPhase] = useState('loading') // loading → expand → fade
  const [videoReady, setVideoReady] = useState(false)
  const [countDone, setCountDone] = useState(false)
  const progress = useMotionValue(0)
  const percent = useTransform(progress, (v) => `${Math.round(v)}%`)
  const width = useTransform(progress, (v) => `${v}%`)
  const doneRef = useRef(false)

  const lines = LINES[lang]
  let index = 0
  const numbered = (group) =>
    group.map((words) => {
      const start = index
      index += words.length
      return { words, start }
    })
  const before = numbered(lines.before)
  const after = numbered(lines.after)

  // Lock scrolling while the intro is up.
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const controls = animate(progress, 100, { duration: LOAD_MS / 1000, ease: [0.65, 0, 0.35, 1], onComplete: () => setCountDone(true) })
    const fallback = setTimeout(() => setVideoReady(true), MAX_WAIT_MS)
    return () => {
      controls.stop()
      clearTimeout(fallback)
    }
  }, [progress])

  useEffect(() => {
    if (phase === 'loading' && countDone && videoReady) {
      const t = setTimeout(() => setPhase('expand'), 350)
      return () => clearTimeout(t)
    }
  }, [phase, countDone, videoReady])

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase('fade')
  }

  const expanded = phase !== 'loading'

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'fade' ? 0 : 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      onAnimationComplete={() => phase === 'fade' && onDone()}
      className="fixed inset-0 z-[80] bg-ecru"
      aria-hidden="true"
    >
      <motion.div
        initial="hidden"
        animate={expanded ? 'leave' : 'shown'}
        className="flex h-full flex-col items-center justify-center px-4 text-center font-display text-[clamp(2rem,5.4vw,4.4rem)] leading-[1.02] text-graphite"
      >
        {before.map((l) => (
          <Line key={l.start} {...l} />
        ))}

        <div className="my-[0.18em] h-[clamp(64px,9vw,118px)] w-[clamp(112px,15vw,200px)]">
          <motion.div
            layout
            transition={{ layout: { duration: 1.25, ease: [0.76, 0, 0.24, 1] } }}
            onLayoutAnimationComplete={() => expanded && finish()}
            className={`overflow-hidden bg-graphite ${expanded ? 'fixed inset-0 z-10' : 'relative size-full'}`}
          >
            <motion.video
              src={media?.src}
              poster={media?.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onCanPlay={() => setVideoReady(true)}
              initial={{ clipPath: 'inset(50% 0% 50% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 1, ease: EASE, delay: 0.5 }}
              className="size-full object-cover [filter:brightness(1.02)_saturate(1.05)_sepia(.12)]"
            />
          </motion.div>
        </div>

        {after.map((l) => (
          <Line key={l.start} {...l} />
        ))}
      </motion.div>

      {/* Hairline progress with the running percentage riding its tip. */}
      <motion.div
        animate={{ opacity: expanded ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-x-4 bottom-8 md:inset-x-8 xl:inset-x-12"
      >
        <div className="relative h-px bg-graphite/10">
          <motion.div style={{ width }} className="absolute inset-y-0 left-0 bg-graphite" />
          <motion.span
            style={{ left: width }}
            className="absolute -top-6 -translate-x-full font-serif text-[12px] text-graphite/70 italic tabular-nums"
          >
            {percent}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}
