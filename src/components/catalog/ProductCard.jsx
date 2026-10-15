import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { dict, formatPrice } from '../../lib/i18n'
import { transition } from '../../lib/motion'

const lookImage = {
  rest: { opacity: 1, scale: 1 },
  hover: { opacity: 0, scale: 1.04 },
}

// Single-photo pieces: a slow push-in instead of the swap.
const zoomImage = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
}

const detailImage = {
  rest: { opacity: 0, scale: 1.08 },
  hover: { opacity: 1, scale: 1 },
}

const quickAction = {
  rest: { opacity: 0, y: 14 },
  hover: { opacity: 1, y: 0 },
}

// Entrance, played once when the card scrolls into view.
const reveal = {
  hidden: { opacity: 0, y: 24 },
  shown: (i) => ({ opacity: 1, y: 0, transition: transition(0.9, (i % 4) * 0.08) }),
}

const rise = (delay) => ({
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: transition(0.7, delay) },
})

/** Custom-fit pieces link to the atelier booking; ready pieces go to the bag. */
function QuickAction({ product, isCustom, onAdd, children, ...rest }) {
  return isCustom ? (
    <a href={`/atelier?model=${product.id}`} {...rest}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onAdd} {...rest}>
      {children}
    </button>
  )
}

/**
 * Powder-pink satin ribbon draped across the photo, with a slowly running
 * italic "sold out ♡ Âme" line. Sheen and hairline stitching sell the satin.
 */
function SoldOutRibbon({ label }) {
  const run = Array.from({ length: 10 }, (_, i) => (
    <span key={i} className="flex items-center">
      <span className="px-4 italic">{label.toLowerCase()}</span>
      <span className="text-[10px] not-italic opacity-70">♡</span>
      <span className="px-4 tracking-[0.3em] uppercase not-italic text-[9px]">Âme</span>
      <span className="text-[10px] not-italic opacity-70">♡</span>
    </span>
  ))
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-25%] top-[56%] -translate-y-1/2 -rotate-[7deg] overflow-hidden bg-[linear-gradient(180deg,#F3DFD8_0%,#FBF1EC_42%,#EBCFC6_100%)] py-[7px] shadow-[0_6px_18px_-8px_rgba(140,90,80,0.45)]"
    >
      {/* stitched hairlines along both edges */}
      <span className="absolute inset-x-0 top-[3px] border-t border-dashed border-white/80" />
      <span className="absolute inset-x-0 bottom-[3px] border-t border-dashed border-white/80" />
      <motion.div
        className="flex w-max items-center font-serif text-[14px] whitespace-nowrap text-[#87564C]"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 34, ease: 'linear', repeat: Infinity }}
      >
        {run}
        {run}
      </motion.div>
    </div>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-9.2-9.5C1.6 7.4 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.4 4.6 7-1.7 4.9-9.2 9.5-9.2 9.5Z" />
    </svg>
  )
}

/**
 * Aurelle-style product tile: hairline frame, blush photo field over a pale
 * caption block with a centred serif name and a tracked price.
 *
 * Hover / keyboard focus swaps the full-length look for the fabric close-up
 * and slides in the quick action. "Custom Fit" pieces book a fitting instead
 * of going straight to the bag. Sold-out pieces get a running ribbon and no
 * quick action; discounted ones show the regular price struck through.
 */
export default function ProductCard({ product, lang = 'ua', index = 0, onQuickAdd, wished = false, onToggleWish }) {
  const t = dict[lang].catalog
  const [active, setActive] = useState(false)
  const { name, href, price, oldPrice, badge, image, hoverImage, sizes, soldOut } = product
  const inStock = sizes?.filter(([, ok]) => ok).map(([s]) => s) ?? []
  // A single size left is picked for the customer.
  const [size, setSize] = useState(inStock.length === 1 ? inStock[0] : null)
  const [askSize, setAskSize] = useState(0) // bumps to replay the "pick a size" nudge
  const isCustom = badge === 'Custom Fit'
  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0

  const needsSize = !isCustom && inStock.length > 0
  const actionLabel = isCustom ? t.bookFitting : needsSize && !size ? t.chooseSize : size ? `${t.addToCart} · ${size}` : t.addToCart

  const add = () => {
    if (needsSize && !size) {
      setAskSize((n) => n + 1)
      return
    }
    onQuickAdd?.(product, size)
  }
  const actionClass =
    'flex h-11 w-full items-center justify-center bg-milk/90 text-[11px] tracking-[0.16em] text-graphite uppercase backdrop-blur-sm transition-colors duration-300 hover:bg-graphite hover:text-milk'

  const actionProps = { product, isCustom, onAdd: add }

  return (
    <motion.article
      custom={index}
      variants={reveal}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      onHoverStart={() => setActive(true)}
      onHoverEnd={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setActive(false)}
      className="flex h-full flex-col border border-sand bg-linen"
    >
      <motion.div
        initial={false}
        animate={active ? 'hover' : 'rest'}
        className="relative aspect-[4/5] overflow-hidden bg-blush"
      >
        {/* The caption link below is the one in tab order; this one is a pointer shortcut. */}
        <a href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
          <motion.img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            variants={hoverImage ? lookImage : zoomImage}
            transition={transition(hoverImage ? 0.9 : 1.4)}
            className="absolute inset-0 size-full object-cover object-[50%_20%]"
          />
          {hoverImage && (
            <motion.img
              src={hoverImage}
              alt=""
              loading="lazy"
              decoding="async"
              variants={detailImage}
              transition={transition(0.9)}
              className="absolute inset-0 size-full object-cover"
            />
          )}
          {soldOut && <span className="absolute inset-0 bg-[#F6E6E0]/45 mix-blend-screen" />}
        </a>

        {soldOut && <SoldOutRibbon label={t.soldOut} />}

        {(badge || discount > 0) && (
          <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5 md:top-4 md:left-4">
            {badge && (
              <span className="bg-milk/85 px-2.5 py-1 text-[9px] tracking-[0.2em] text-taupe uppercase backdrop-blur-sm md:text-[10px]">
                {badge}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-graphite px-2.5 py-1 text-[9px] tracking-[0.2em] text-milk uppercase md:text-[10px]">
                {t.sale} −{discount}%
              </span>
            )}
          </div>
        )}

        {onToggleWish && (
          <button
            type="button"
            aria-pressed={wished}
            aria-label={`${wished ? t.wishlistRemove : t.wishlistAdd}: ${name}`}
            onClick={() => onToggleWish(product)}
            className="absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-milk/85 text-graphite backdrop-blur-sm transition-colors duration-300 hover:bg-milk md:top-3.5 md:right-3.5"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={wished ? 'on' : 'off'}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                className="grid place-items-center"
              >
                <HeartIcon filled={wished} />
              </motion.span>
            </AnimatePresence>
          </button>
        )}

        {!soldOut && (
          <>
            {/* Pointer devices: full-width action slides up on hover / focus. */}
            <motion.div
              variants={quickAction}
              transition={transition(0.55)}
              className="absolute inset-x-3 bottom-3 hidden md:inset-x-4 md:bottom-4 [@media(hover:hover)]:block"
            >
              <QuickAction {...actionProps} className={actionClass}>
                {actionLabel}
              </QuickAction>
            </motion.div>

            {/* Touch devices: a quiet round button that is always there. */}
            <QuickAction
              {...actionProps}
              aria-label={`${actionLabel}: ${name}`}
              className="absolute right-2.5 bottom-2.5 grid size-9 place-items-center rounded-full bg-milk/90 text-graphite backdrop-blur-sm transition-transform active:scale-95 [@media(hover:hover)]:hidden"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {isCustom ? <path d="M4 20 20 4M9 4h11v11" /> : <path d="M12 4v16M4 12h16" />}
              </svg>
            </QuickAction>
          </>
        )}
      </motion.div>

      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 border-t border-sand px-3 py-4 text-center md:py-5">
        <motion.h3 variants={rise(0.15)} className="font-serif text-[17px] leading-tight md:text-[21px]">
          <a
            href={href}
            className={`transition-colors duration-500 focus-visible:underline focus-visible:outline-none ${
              active ? 'text-graphite' : 'text-taupe'
            }`}
          >
            {name}
          </a>
          {soldOut && <span className="sr-only"> — {t.soldOut}</span>}
        </motion.h3>

        <motion.p
          variants={rise(0.25)}
          className="flex flex-wrap items-baseline justify-center gap-x-2.5 text-[12px] tracking-[0.12em] tabular-nums md:text-[13px]"
        >
          {oldPrice ? (
            <>
              <span className="text-graphite">
                <span className="sr-only">{t.salePrice}: </span>
                {formatPrice(price, lang)}
              </span>
              <s className="text-mist">
                <span className="sr-only">{t.oldPrice}: </span>
                {formatPrice(oldPrice, lang)}
              </s>
            </>
          ) : (
            <span className="text-graphite/80">{formatPrice(price, lang)}</span>
          )}
        </motion.p>

        <motion.div variants={rise(0.35)} className="mt-0.5 text-[10px] tracking-[0.14em] text-taupe uppercase md:text-[11px]">
          {sizes ? (
            <motion.ul
              key={askSize}
              role="group"
              aria-label={t.sizes}
              animate={askSize ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
              transition={{ duration: 0.45 }}
              className="flex flex-wrap justify-center gap-1"
            >
              {sizes.map(([label, ok]) => {
                const selected = size === label
                return (
                  <li key={label}>
                    <button
                      type="button"
                      disabled={!ok || soldOut}
                      aria-pressed={selected}
                      onClick={() => setSize(selected ? null : label)}
                      className={`min-w-8 border px-1.5 py-1 transition-colors duration-300 disabled:cursor-not-allowed disabled:border-transparent disabled:text-mist/60 disabled:line-through ${
                        selected
                          ? 'border-graphite bg-graphite text-milk'
                          : askSize
                            ? 'border-[#c9a49a] text-graphite hover:border-graphite'
                            : 'border-transparent hover:border-graphite/40 hover:text-graphite'
                      }`}
                    >
                      {label}
                      {!ok && <span className="sr-only"> — {t.unavailable}</span>}
                    </button>
                  </li>
                )
              })}
            </motion.ul>
          ) : (
            <span className="tracking-[0.04em] normal-case italic">{t.customSize}</span>
          )}
        </motion.div>
      </div>
    </motion.article>
  )
}
