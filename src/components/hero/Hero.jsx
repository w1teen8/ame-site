import { motion } from 'framer-motion'
import { EASE, transition } from '../../lib/motion'
import { REDUCED_QUERY, useHeroMedia, useMedia } from '../../lib/useMedia'

const tagline = {
  ua: 'Жіночність, створена вручну.',
  en: 'Femininity, made by hand.',
}

const scrollHint = { ua: 'Гортайте вниз', en: 'Scroll down' }

// Each letter rises out of its mask and comes into focus.
const letter = {
  hidden: { y: '70%', opacity: 0, filter: 'blur(18px)' },
  shown: (i) => ({
    y: '0%',
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 1.6, ease: EASE, delay: 0.15 + i * 0.14 },
  }),
}

// The whole word settles from wide tracking to its final spacing.
const word = {
  hidden: { letterSpacing: '0.32em' },
  shown: { letterSpacing: '0.01em', transition: { duration: 2.4, ease: EASE } },
}

const rule = {
  hidden: { scaleX: 0, opacity: 0 },
  shown: { scaleX: 1, opacity: 1, transition: { duration: 1.4, ease: EASE, delay: 0.9 } },
}

const taglineWord = {
  hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
  shown: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: EASE, delay: 1.15 + i * 0.12 },
  }),
}

/**
 * Full-screen opening frame in the Gownora manner: dark, slightly warm
 * footage, the brand name set large in the centre, one italic line beneath.
 *
 * Only the clip that fits the viewport is loaded: a landscape one for
 * tablets/desktop, a portrait one for phones. With reduced motion the
 * poster frame is shown instead of the video.
 *
 * @param {{src: string, poster?: string}} [desktop]
 * @param {{src: string, poster?: string}} [mobile]  Falls back to `desktop`.
 * @param {boolean} [ready=true]  Hold the title animation (e.g. under an intro).
 */
export default function Hero({ lang = 'ua', desktop, mobile, scrollTarget = '#main', ready = true }) {
  const media = useHeroMedia(desktop, mobile)
  const reduced = useMedia(REDUCED_QUERY)
  const state = ready ? 'shown' : 'hidden'

  return (
    <section className="relative grid h-svh min-h-[560px] place-items-center overflow-hidden bg-[#1f1a17] text-milk">
      {media && (
        <div className="absolute inset-0 [filter:brightness(1.02)_saturate(1.05)_sepia(.12)]">
          {reduced ? (
            <img className="size-full object-cover" src={media.poster} alt="" />
          ) : (
            <video
              key={media.src}
              className="size-full object-cover"
              src={media.src}
              poster={media.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          )}
        </div>
      )}
      {/* Darken the footage and pool shadow behind the type so white text stays legible. */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#16110e]/30" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_50%,rgba(20,16,14,0.45),transparent_75%)]" />

      <motion.div initial="hidden" animate={state} className="relative flex flex-col items-center px-4 text-center">
        <motion.h1
          aria-label="Âme"
          variants={word}
          className="flex font-hero text-[clamp(4.5rem,15vw,12rem)] leading-[0.95] uppercase [text-shadow:0_2px_40px_rgba(10,8,6,0.45)]"
        >
          {['Â', 'M', 'E'].map((ch, i) => (
            <span key={ch} aria-hidden="true" className="inline-block overflow-hidden pt-[0.14em] pb-[0.04em]">
              <motion.span custom={i} variants={letter} className="inline-block will-change-transform">
                {ch}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.span aria-hidden="true" variants={rule} className="mt-5 block h-px w-24 origin-center bg-milk/60 md:mt-6 md:w-32" />

        <p className="mt-4 font-serif text-[clamp(1.1rem,1.7vw,1.5rem)] leading-snug italic md:mt-5">
          {tagline[lang].split(' ').map((w, i) => (
            <motion.span key={`${lang}-${i}`} custom={i} variants={taglineWord} className="inline-block whitespace-pre">
              {w}{' '}
            </motion.span>
          ))}
        </p>
      </motion.div>

      <motion.a
        href={scrollTarget}
        aria-label={scrollHint[lang]}
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 0.45 : 0 }}
        whileHover={{ opacity: 0.9 }}
        transition={transition(1, ready ? 1.8 : 0)}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </motion.a>
    </section>
  )
}
