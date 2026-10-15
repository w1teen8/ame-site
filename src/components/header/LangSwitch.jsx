import { Fragment, useId } from 'react'
import { motion } from 'framer-motion'
import { LANGS } from '../../lib/i18n'
import { transition } from '../../lib/motion'

export default function LangSwitch({ lang, onChange, label, className = '' }) {
  const id = useId()

  return (
    <div role="group" aria-label={label} className={`flex items-center gap-1.5 ${className}`}>
      {LANGS.map((code, i) => {
        const active = code === lang
        return (
          <Fragment key={code}>
            {i > 0 && (
              <span aria-hidden="true" className="opacity-35">
                /
              </span>
            )}
            <button
              type="button"
              lang={code === 'ua' ? 'uk' : 'en'}
              aria-pressed={active}
              onClick={() => onChange(code)}
              className={`relative py-1 uppercase transition-opacity duration-300 ${
                active ? 'opacity-100' : 'opacity-45 hover:opacity-80'
              }`}
            >
              {code}
              {active && (
                <motion.span
                  layoutId={`lang-underline-${id}`}
                  transition={transition(0.5)}
                  className="absolute inset-x-0 bottom-0 h-px bg-current"
                />
              )}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
