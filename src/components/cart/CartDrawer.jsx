import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { dict, formatPrice, itemsLabel } from '../../lib/i18n'
import { EASE, transition } from '../../lib/motion'
import { CloseIcon } from '../header/icons'
import Button from '../ui/Button'

const panel = {
  hidden: { x: '100%' },
  shown: { x: '0%', transition: { duration: 0.75, ease: EASE } },
  exit: { x: '100%', transition: { duration: 0.5, ease: [0.4, 0, 1, 1] } },
}

const row = {
  hidden: { opacity: 0, y: 14 },
  shown: (i) => ({ opacity: 1, y: 0, transition: transition(0.6, 0.25 + i * 0.06) }),
  exit: { opacity: 0, x: 40, transition: transition(0.35) },
}

function Stepper({ value, onChange, t }) {
  const btn = 'grid size-8 place-items-center text-[15px] transition-colors hover:bg-graphite hover:text-milk disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-graphite'
  return (
    <div role="group" aria-label={t.qty} className="inline-flex items-center border border-graphite/15">
      <button type="button" aria-label={t.decrease} disabled={value <= 1} onClick={() => onChange(value - 1)} className={btn}>
        −
      </button>
      <span aria-live="polite" className="w-8 text-center text-[13px] tabular-nums">
        {value}
      </span>
      <button type="button" aria-label={t.increase} disabled={value >= 9} onClick={() => onChange(value + 1)} className={btn}>
        +
      </button>
    </div>
  )
}

/**
 * Slide-in bag, Aurelle-style: ecru panel from the right over a soft veil.
 * `items` are `{ key, product, size, qty }`; the parent owns the state.
 */
export default function CartDrawer({ open, onClose, items, lang, onQtyChange, onSizeChange, onRemove, checkoutHref = '/checkout', catalogHref = '#all-products' }) {
  const t = dict[lang].cartDrawer
  const tc = dict[lang].catalog
  const closeRef = useRef(null)
  const panelRef = useRef(null)
  const count = items.reduce((n, i) => n + i.qty, 0)
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    const returnTo = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panelRef.current) return
      const f = [...panelRef.current.querySelectorAll('a[href], button:not([disabled]), select')]
      if (!f.length) return
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault()
        f[f.length - 1].focus()
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault()
        f[0].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      returnTo?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75]">
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition(0.5)}
            onClick={onClose}
            className="absolute inset-0 bg-[#f0e9dd]/60 backdrop-blur-[3px]"
          />

          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            variants={panel}
            initial="hidden"
            animate="shown"
            exit="exit"
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-ecru text-graphite shadow-[-24px_0_60px_-30px_rgba(26,26,26,0.35)]"
          >
            <header className="flex items-center justify-between border-b border-sand px-6 py-6 md:px-8 md:py-7">
              <h2 id="cart-title" className="font-display text-[28px] leading-none">
                {t.title} <span className="font-serif text-[15px] text-mist italic">({itemsLabel(count, lang)})</span>
              </h2>
              <button ref={closeRef} type="button" aria-label={t.close} onClick={onClose} className="-mr-2 grid size-10 place-items-center transition-opacity hover:opacity-60">
                <CloseIcon width={20} height={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition(0.7, 0.3)}
                className="flex flex-1 flex-col items-center justify-center px-8 text-center"
              >
                <p className="font-display text-[30px] leading-tight">{t.empty}</p>
                <p className="mt-3 max-w-[280px] text-[14px] leading-relaxed text-taupe italic">{t.emptyNote}</p>
                <Button href={catalogHref} onClick={onClose} className="mt-8">
                  {t.toCatalog}
                </Button>
              </motion.div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 md:px-8">
                  <AnimatePresence initial={false}>
                    {items.map((item, i) => {
                      const { product } = item
                      const inStock = product.sizes?.filter(([, ok]) => ok).map(([s]) => s) ?? []
                      return (
                        <motion.li
                          key={item.key}
                          layout
                          custom={i}
                          variants={row}
                          initial="hidden"
                          animate="shown"
                          exit="exit"
                          className="flex gap-4 border-b border-sand py-5"
                        >
                          <a href={product.href} className="block w-[84px] shrink-0 overflow-hidden bg-blush">
                            <img src={product.image} alt="" className="aspect-[4/5] w-full object-cover object-[50%_20%]" />
                          </a>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <a href={product.href} className="font-serif text-[17px] leading-snug hover:underline">
                                {product.name}
                              </a>
                              <p className="shrink-0 text-[13px] tracking-[0.06em] tabular-nums">{formatPrice(product.price * item.qty, lang)}</p>
                            </div>

                            <div className="mt-1.5 text-[11px] tracking-[0.14em] text-taupe uppercase">
                              {item.size && inStock.length > 1 ? (
                                <label className="inline-flex items-center gap-2">
                                  {t.size}:
                                  <select
                                    value={item.size}
                                    onChange={(e) => onSizeChange(item.key, e.target.value)}
                                    className="cursor-pointer border-b border-graphite/20 bg-transparent pr-1 text-graphite focus:outline-none"
                                  >
                                    {inStock.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              ) : item.size ? (
                                <span>
                                  {t.size}: {item.size}
                                </span>
                              ) : (
                                <span className="normal-case italic tracking-normal">{tc.customSize}</span>
                              )}
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4">
                              <Stepper value={item.qty} onChange={(q) => onQtyChange(item.key, q)} t={t} />
                              <button type="button" onClick={() => onRemove(item.key)} className="text-[11px] tracking-[0.14em] text-taupe uppercase underline-offset-4 hover:text-graphite hover:underline">
                                {t.remove}
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>

                <motion.footer
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={transition(0.6, 0.35)}
                  className="border-t border-sand px-6 pt-5 pb-7 md:px-8"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] tracking-[0.2em] text-taupe uppercase">{t.subtotal}</span>
                    <span className="font-display text-[26px] tabular-nums">{formatPrice(subtotal, lang)}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-mist italic">{t.shippingNote}</p>
                  <Button href={checkoutHref} className="mt-5 w-full">
                    {t.checkout}
                  </Button>
                  <button type="button" onClick={onClose} className="mt-3 w-full py-2 text-[11px] tracking-[0.18em] text-taupe uppercase transition-colors hover:text-graphite">
                    {t.continue}
                  </button>
                </motion.footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
