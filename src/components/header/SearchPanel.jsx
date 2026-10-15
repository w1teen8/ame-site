import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { transition } from '../../lib/motion'
import { ArrowIcon } from './icons'

/**
 * Drops down under the header bar. The header's own milk/blur layer sits
 * behind it, so the panel reads as one surface with the bar.
 */
export default function SearchPanel({ id, t, onSearch, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = (value) => {
    const q = value.trim()
    if (!q) return
    onSearch(q)
    onClose()
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={transition(0.6)}
      className="relative overflow-hidden"
    >
      <div className="mx-auto max-w-[1728px] px-4 pt-6 pb-10 md:px-[30px] md:pt-10 md:pb-14">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            submit(query)
          }}
          className="mx-auto flex max-w-3xl items-end gap-4 border-b border-graphite/20 pb-3 transition-colors focus-within:border-graphite"
        >
          <label htmlFor={`${id}-input`} className="sr-only">
            {t.searchLabel}
          </label>
          <input
            ref={inputRef}
            id={`${id}-input`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent font-display text-[28px] leading-tight text-graphite placeholder:text-graphite/30 focus:outline-none md:text-[40px] [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="submit"
            aria-label={t.searchSubmit}
            className="mb-2 grid size-10 shrink-0 place-items-center text-graphite transition-transform duration-500 ease-couture hover:translate-x-1"
          >
            <ArrowIcon width={22} height={22} />
          </button>
        </form>

        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-2.5">
          <span className="mr-2 text-[10px] tracking-[0.2em] text-mist uppercase">{t.popular}</span>
          {t.suggestions.map((s, i) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => submit(s)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition(0.5, 0.15 + i * 0.04)}
              className="border border-graphite/15 px-3.5 py-1.5 text-[12px] text-graphite/80 transition-colors duration-300 hover:border-graphite hover:bg-graphite hover:text-milk"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
