import { useReducedMotion } from 'framer-motion'

/**
 * Decorative full-bleed video strip between the two showcases: a 24:7 cut of
 * the hero footage, chosen so the dancer stays in frame head to toe; narrower
 * screens crop the sides only. With reduced
 * motion only the poster frame is shown.
 */
export default function Banner({ video, poster }) {
  const reduced = useReducedMotion()
  const media = 'absolute inset-0 size-full object-cover'

  return (
    <div aria-hidden="true" className="relative aspect-[4/3] overflow-hidden bg-[#1f1a17] [&>*]:[filter:brightness(1.02)_saturate(1.05)_sepia(.12)] sm:aspect-[16/7] lg:aspect-[24/7]">
      {reduced || !video ? (
        <img src={poster} alt="" loading="lazy" decoding="async" className={media} />
      ) : (
        <video src={video} poster={poster} autoPlay muted loop playsInline preload="metadata" className={media} />
      )}
    </div>
  )
}
