import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { dict, itemsLabel } from '../../lib/i18n'
import { transition } from '../../lib/motion'
import LangSwitch from './LangSwitch'
import MobileMenu from './MobileMenu'
import RollingText, { rollingTrigger } from './RollingText'
import SearchPanel from './SearchPanel'
import { BagIcon, CloseIcon, SearchIcon, UserIcon } from './icons'

const SCROLL_THRESHOLD = 24
const DESKTOP_QUERY = '(min-width: 1280px)'

const defaultSearch = (q) => {
  window.location.assign(`/search?q=${encodeURIComponent(q)}`)
}

/**
 * Âme storefront header, Aurelle layout: five links on the left, a widely
 * tracked wordmark in the centre, search / account / bag (0) on the right.
 *
 * Sits on a solid ecru bar at the top of the page and turns into milk glass
 * with backdrop blur once the page scrolls.
 *
 * @param {'ua'|'en'} [lang]           Controlled language. Omit to let the header manage it.
 * @param {(lang) => void} [onLangChange]
 * @param {number} [cartCount=0]
 * @param {() => void} [onCartClick]   Omit to link to /cart instead.
 * @param {(query) => void} [onSearch] Omit to navigate to /search?q=…
 * @param {{href,label}[]} [navItems]  Defaults to the five Âme sections.
 * @param {string} [currentPath]       Marks the matching nav item as current.
 * @param {string} [accountHref='/account']
 * @param {boolean} [transparentAtTop=false]  Float over a full-bleed hero
 *        instead of sitting on the ecru bar until the page scrolls.
 * @param {'light'|'dark'} [topTone='light']  Text colour while transparent.
 */
export default function Header({
  lang: langProp,
  onLangChange,
  cartCount = 0,
  onCartClick,
  onSearch = defaultSearch,
  navItems,
  currentPath,
  accountHref = '/account',
  transparentAtTop = false,
  topTone = 'light',
}) {
  const [langState, setLangState] = useState('ua')
  const lang = langProp ?? langState
  const setLang = (next) => (onLangChange ? onLangChange(next) : setLangState(next))
  const t = dict[lang]

  const items = navItems ?? [
    { href: '/shop', label: t.nav.shop },
    { href: '/collections', label: t.nav.collections },
    { href: '/atelier', label: t.nav.atelier },
    { href: '/about', label: t.nav.about },
    { href: '/contacts', label: t.nav.contacts },
  ]

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)
  const searchButtonRef = useRef(null)
  const uid = useId()
  const menuId = `${uid}-menu`
  const searchId = `${uid}-search`

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > SCROLL_THRESHOLD))
  useEffect(() => setScrolled(window.scrollY > SCROLL_THRESHOLD), [])

  const solid = scrolled || searchOpen
  const showBar = !menuOpen && (solid || !transparentAtTop)
  const darkText = menuOpen || solid || !transparentAtTop || topTone === 'dark'

  const closeMenu = useCallback((restoreFocus = true) => {
    setMenuOpen(false)
    if (restoreFocus) menuButtonRef.current?.focus()
  }, [])

  const closeSearch = useCallback((restoreFocus = true) => {
    setSearchOpen(false)
    if (restoreFocus) searchButtonRef.current?.focus()
  }, [])

  // Escape closes whatever is open.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (menuOpen) closeMenu()
      if (searchOpen) closeSearch()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen, searchOpen, closeMenu, closeSearch])

  // Lock page scroll under the full-screen menu.
  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prev
    }
  }, [menuOpen])

  // The mobile menu has no meaning on desktop — drop it if the viewport grows.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e) => e.matches && setMenuOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Keep Tab inside the header (bar + menu) while the menu is open.
  const trapFocus = (e) => {
    if (!menuOpen || e.key !== 'Tab') return
    const focusables = [
      ...headerRef.current.querySelectorAll('a[href], button:not([disabled]), input'),
    ].filter((el) => el.getClientRects().length > 0)
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const toggleMenu = () => {
    setSearchOpen(false)
    setMenuOpen((open) => !open)
  }

  const toggleSearch = () => {
    setMenuOpen(false)
    setSearchOpen((open) => !open)
  }

  const iconButton =
    'relative grid size-10 place-items-center transition-opacity duration-300 hover:opacity-60 focus-visible:outline-1 focus-visible:outline-offset-[-4px] focus-visible:outline-current'

  const cartLabel = `${t.cart}, ${itemsLabel(cartCount, lang)}`
  const CartTag = onCartClick ? 'button' : 'a'
  const cartProps = onCartClick ? { type: 'button', onClick: onCartClick } : { href: '/cart' }

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-graphite focus:px-4 focus:py-2 focus:text-[12px] focus:text-milk"
      >
        {t.skip}
      </a>

      <header
        ref={headerRef}
        onKeyDown={trapFocus}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-couture ${
          darkText ? 'text-graphite' : 'text-milk'
        }`}
      >
        {/* Bar surface: solid ecru at the top, milk glass once scrolled. */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: showBar ? 1 : 0 }}
          transition={transition(0.6)}
          className={`pointer-events-none absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ease-couture ${
            solid
              ? 'border-graphite/[0.07] bg-milk/80 backdrop-blur-xl backdrop-saturate-150'
              : 'border-transparent bg-ecru'
          }`}
        />

        <motion.div
          initial={false}
          animate={{ height: solid ? 64 : 76 }}
          transition={transition(0.6)}
          className="relative mx-auto grid max-w-[1920px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 xl:px-12"
        >
          {/* Left — desktop navigation */}
          <nav aria-label={t.menu} className="hidden justify-self-start xl:block">
            <ul className="flex items-center gap-5 text-[11px] tracking-[0.08em] uppercase 2xl:gap-[30px] 2xl:text-[12px]">
              {items.map((item) => {
                const current = currentPath === item.href
                return (
                  <li key={item.href}>
                    <motion.a
                      href={item.href}
                      aria-current={current ? 'page' : undefined}
                      {...rollingTrigger}
                      className="relative block py-1 leading-[1.4]"
                    >
                      <RollingText>{item.label}</RollingText>
                      {current && <span className="absolute inset-x-0 bottom-0 h-px bg-current" />}
                    </motion.a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Left — menu toggle below xl */}
          <div className="justify-self-start xl:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? t.close : t.menu}
              onClick={toggleMenu}
              className={`${iconButton} -ml-2.5`}
            >
              <span aria-hidden="true" className="relative block h-[7px] w-[20px]">
                <motion.span
                  className="absolute inset-x-0 top-0 h-px bg-current"
                  animate={menuOpen ? { y: 3, rotate: 45 } : { y: 0, rotate: 0 }}
                  transition={transition(0.5)}
                />
                <motion.span
                  className="absolute inset-x-0 bottom-0 h-px bg-current"
                  animate={menuOpen ? { y: -3, rotate: -45 } : { y: 0, rotate: 0 }}
                  transition={transition(0.5)}
                />
              </span>
            </button>
          </div>

          {/* Centre — wordmark. Negative right margin cancels the trailing letter-space so it stays centred. */}
          <motion.a
            href={import.meta.env.BASE_URL}
            aria-label={t.home}
            initial={false}
            animate={{ scale: solid ? 0.88 : 1 }}
            transition={transition(0.6)}
            className="mr-[-0.42em] justify-self-center font-wordmark text-[26px] leading-none tracking-[0.42em] uppercase md:text-[32px]"
          >
            Âme
          </motion.a>

          {/* Right — language, search, account, bag */}
          <div className="-mr-2.5 flex items-center justify-self-end gap-0.5 md:gap-1.5">
            <LangSwitch
              lang={lang}
              onChange={setLang}
              label={t.language}
              className="mr-3 hidden text-[11px] tracking-[0.12em] xl:flex"
            />

            <button
              ref={searchButtonRef}
              type="button"
              aria-label={searchOpen ? t.close : t.search}
              aria-expanded={searchOpen}
              aria-controls={searchId}
              onClick={toggleSearch}
              className={iconButton}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={searchOpen ? 'close' : 'search'}
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={transition(0.3)}
                  className="grid place-items-center"
                >
                  {searchOpen ? <CloseIcon width={20} height={20} /> : <SearchIcon width={20} height={20} />}
                </motion.span>
              </AnimatePresence>
            </button>

            <a href={accountHref} aria-label={t.account} className={`${iconButton} hidden md:grid`}>
              <UserIcon width={20} height={20} />
            </a>

            <CartTag
              {...cartProps}
              aria-label={cartLabel}
              className="flex h-10 items-center gap-1.5 px-2.5 transition-opacity duration-300 hover:opacity-60 focus-visible:outline-1 focus-visible:outline-offset-[-4px] focus-visible:outline-current"
            >
              <BagIcon width={20} height={20} />
              <span aria-hidden="true" className="flex text-[12px] tabular-nums">
                (
                <span className="relative inline-flex overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={cartCount}
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '-100%', opacity: 0 }}
                      transition={transition(0.45)}
                      className="block"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  </AnimatePresence>
                </span>
                )
              </span>
            </CartTag>
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {searchOpen && (
            <SearchPanel id={searchId} t={t} onSearch={onSearch} onClose={() => closeSearch(false)} />
          )}
        </AnimatePresence>

        {/* Dim the page under the open search panel; click to dismiss. */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              aria-hidden="true"
              onClick={() => closeSearch(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition(0.5)}
              className="fixed inset-0 -z-20 bg-graphite/20 backdrop-blur-[2px]"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {menuOpen && (
            <MobileMenu
              id={menuId}
              t={t}
              items={items}
              currentPath={currentPath}
              lang={lang}
              onLangChange={setLang}
              accountHref={accountHref}
              onNavigate={() => closeMenu(false)}
            />
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  )
}
