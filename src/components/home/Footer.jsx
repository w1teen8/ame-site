import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { dict } from '../../lib/i18n'
import { transition } from '../../lib/motion'
import LangSwitch from '../header/LangSwitch'
import Button from '../ui/Button'

const INSTAGRAM = 'https://www.instagram.com/ame.ukraine/'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * ÂME watermark spanning the full height of the footer. The glyphs' ink box
 * (circumflex top to baseline) is measured once the font is loaded, and the
 * SVG viewBox is cropped to it, so the letters touch the top and bottom edges.
 */
function Wordmark() {
  const [box, setBox] = useState(null)

  useEffect(() => {
    let alive = true
    document.fonts.load('300 100px Playfair', 'ÂME').then(() => {
      const ctx = document.createElement('canvas').getContext('2d')
      ctx.font = '300 1000px Playfair'
      const m = ctx.measureText('ÂME')
      if (alive) {
        setBox({ left: m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent })
      }
    })
    return () => {
      alive = false
    }
  }, [])

  if (!box) return null
  const width = box.left + box.right
  const height = box.asc + box.desc

  return (
    <svg
      aria-hidden="true"
      viewBox={`${-box.left} ${-box.asc} ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 size-full text-milk/[0.05] select-none"
    >
      <text x="0" y="0" fontSize="1000" fill="currentColor" style={{ fontFamily: 'Playfair', fontWeight: 300, fontVariationSettings: '"opsz" 1200' }}>
        ÂME
      </text>
    </svg>
  )
}

function LinkColumn({ title, links }) {
  return (
    <nav aria-label={title}>
      <p className="text-[10px] tracking-[0.22em] text-milk/45 uppercase">{title}</p>
      <ul className="mt-5 flex flex-col gap-3 text-[14px]">
        {links.map(({ label, href, external }) => (
          <li key={href}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="text-milk/80 transition-colors duration-300 hover:text-milk"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Field({ id, label, error, ...input }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        placeholder={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-11 border-b bg-transparent text-[15px] text-milk placeholder:text-milk/40 focus:outline-none ${
          error ? 'border-[#d9a49a]' : 'border-milk/25 focus:border-milk'
        } transition-colors`}
        {...input}
      />
      {error && (
        <span id={`${id}-error`} className="mt-1.5 text-[12px] text-[#e8b9af]">
          {error}
        </span>
      )}
    </div>
  )
}

/**
 * Site footer: language, three link columns, newsletter sign-up and the
 * oversized wordmark. `onSubscribe({name, email})` may return a promise.
 */
export default function Footer({ lang, onLangChange, onSubscribe }) {
  const t = dict[lang].footer
  const uid = useId()
  const [form, setForm] = useState({ name: '', email: '', consent: false })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = t.errors.name
    if (!EMAIL_RE.test(form.email.trim())) next.email = t.errors.email
    if (!form.consent) next.consent = t.errors.consent
    setErrors(next)
    if (Object.keys(next).length) return
    setStatus('sending')
    try {
      await onSubscribe?.({ name: form.name.trim(), email: form.email.trim() })
      setStatus('done')
    } catch {
      setStatus('idle')
    }
  }

  const clients = [
    { label: t.links.terms, href: '/terms' },
    { label: t.links.privacy, href: '/privacy' },
    { label: t.links.delivery, href: '/delivery' },
    { label: t.links.returns, href: '/returns' },
    { label: t.links.contact, href: '/contacts' },
  ]
  const brand = [
    { label: t.links.about, href: '/about' },
    { label: t.links.atelier, href: '/atelier' },
    { label: t.links.archive, href: '/archive' },
  ]
  const social = [{ label: 'Instagram', href: INSTAGRAM, external: true }]

  return (
    <footer className="relative overflow-hidden bg-graphite px-4 pt-16 pb-10 text-milk md:px-8 md:pt-20 xl:px-12">
      <Wordmark />

      <div className="relative mx-auto grid max-w-[1440px] gap-12 border-t border-milk/15 pt-12 lg:grid-cols-[auto_1fr_1fr_1fr_minmax(0,1.6fr)] lg:gap-10">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-milk/45 uppercase">{t.language}</p>
          <LangSwitch lang={lang} onChange={onLangChange} label={t.language} className="mt-5 text-[12px] tracking-[0.14em]" />
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:contents">
          <LinkColumn title={t.clients} links={clients} />
          <LinkColumn title={t.brand} links={brand} />
          <LinkColumn title={t.social} links={social} />
        </div>

        <div>
          <p className="max-w-md font-display text-[22px] leading-snug md:text-[26px]">{t.newsletter}</p>

          <AnimatePresence mode="wait" initial={false}>
            {status === 'done' ? (
              <motion.p
                key="done"
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition(0.6)}
                className="mt-8 text-[15px] text-milk/80 italic"
              >
                {t.thanks}
              </motion.p>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={submit}
                exit={{ opacity: 0, y: -8 }}
                transition={transition(0.4)}
                className="mt-8 flex flex-col gap-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id={`${uid}-name`} label={t.name} value={form.name} onChange={set('name')} autoComplete="given-name" error={errors.name} />
                  <Field id={`${uid}-email`} label={t.email} type="email" value={form.email} onChange={set('email')} autoComplete="email" inputMode="email" error={errors.email} />
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-[13px] text-milk/70">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={set('consent')}
                      aria-invalid={Boolean(errors.consent)}
                      className="mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-milk/50 transition-colors checked:border-milk checked:bg-milk checked:shadow-[inset_0_0_0_3px_#1A1A1A] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-milk"
                    />
                    <span>
                      {t.consentBefore}
                      <a href="/privacy" className="underline underline-offset-4 hover:text-milk">
                        {t.consentLink}
                      </a>
                      .
                    </span>
                  </label>
                  {errors.consent && <p className="mt-1.5 text-[12px] text-[#e8b9af]">{errors.consent}</p>}
                </div>

                <Button type="submit" variant="outline" disabled={status === 'sending'} className="self-start">
                  {t.submit}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-[1440px] flex-col gap-2 text-[11px] tracking-[0.08em] text-milk/45 sm:flex-row sm:justify-between md:mt-16">
        <p>
          © {new Date().getFullYear()} Âme. {t.rights}
        </p>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-milk">
          @ame.ukraine
        </a>
      </div>

    </footer>
  )
}
