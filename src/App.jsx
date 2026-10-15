import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import Header from './components/header/Header'
import Hero from './components/hero/Hero'
import Intro from './components/hero/Intro'
import ProductShowcase from './components/catalog/ProductShowcase'
import Banner from './components/home/Banner'
import RegionModal from './components/home/RegionModal'
import Footer from './components/home/Footer'
import CartDrawer from './components/cart/CartDrawer'
import { allProducts, corsetEdit, productsById } from './data/products'
import { dict } from './lib/i18n'
import { REDUCED_QUERY } from './lib/useMedia'

const REGION_KEY = 'ame-region'
const WISHLIST_KEY = 'ame-wishlist'
const INTRO_KEY = 'ame-intro-seen'
const CART_KEY = 'ame-cart'

const HERO_DESKTOP = { src: '/media/hero-desktop.mp4', poster: '/media/hero-desktop.jpg' }
const HERO_MOBILE = { src: '/media/hero-mobile.mp4', poster: '/media/hero-mobile.jpg' }

// The intro plays once per browser session and never with reduced motion.
const shouldPlayIntro = () => {
  if (window.matchMedia(REDUCED_QUERY).matches) return false
  try {
    return !sessionStorage.getItem(INTRO_KEY)
  } catch {
    return true
  }
}

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode — the choice just won't be remembered */
  }
}

// Home page, section order taken from rummywhy.com/uk:
// header → region chooser → hero → collection (3 per row) → full-bleed close-up
// → whole catalogue (4 per row) → "all pieces" button → footer with newsletter.
export default function App() {
  const [lang, setLang] = useState(() => (read(REGION_KEY, null) === 'en' ? 'en' : 'ua'))
  const [cart, setCart] = useState(() =>
    read(CART_KEY, [])
      .filter((i) => productsById[i.id])
      .map((i) => ({ ...i, product: productsById[i.id] })),
  )
  const [cartOpen, setCartOpen] = useState(false)
  const cartCount = cart.reduce((n, i) => n + i.qty, 0)

  useEffect(() => {
    write(CART_KEY, cart.map(({ key, id, size, qty }) => ({ key, id, size, qty })))
  }, [cart])
  const [wishlist, setWishlist] = useState(() => new Set(read(WISHLIST_KEY, [])))
  const [regionOpen, setRegionOpen] = useState(false)
  const [introOpen, setIntroOpen] = useState(shouldPlayIntro)

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      /* ignore */
    }
    setIntroOpen(false)
  }, [])

  const h = dict[lang].homePage

  // Ask where to ship once, after the intro has handed over to the hero.
  useEffect(() => {
    if (introOpen || read(REGION_KEY, null)) return
    const timer = setTimeout(() => setRegionOpen(true), 2600)
    return () => clearTimeout(timer)
  }, [introOpen])

  useEffect(() => {
    document.documentElement.lang = lang === 'ua' ? 'uk' : 'en'
  }, [lang])

  const chooseRegion = useCallback((next) => {
    write(REGION_KEY, next)
    setLang(next)
    setRegionOpen(false)
  }, [])

  const closeRegion = useCallback(() => {
    write(REGION_KEY, lang)
    setRegionOpen(false)
  }, [lang])

  const toggleWish = useCallback((product) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      next.has(product.id) ? next.delete(product.id) : next.add(product.id)
      write(WISHLIST_KEY, [...next])
      return next
    })
  }, [])

  // The card passes the chosen size; the size can still be changed in the bag.
  const addToCart = useCallback((product, chosen) => {
    const size = chosen ?? product.sizes?.find(([, ok]) => ok)?.[0] ?? null
    const key = `${product.id}:${size ?? 'custom'}`
    setCart((prev) => {
      const hit = prev.find((i) => i.key === key)
      if (hit) return prev.map((i) => (i === hit ? { ...i, qty: Math.min(9, i.qty + 1) } : i))
      return [...prev, { key, id: product.id, product, size, qty: 1 }]
    })
    setCartOpen(true)
  }, [])

  const setQty = useCallback((key, qty) => setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i))), [])
  const removeItem = useCallback((key) => setCart((prev) => prev.filter((i) => i.key !== key)), [])
  const setSize = useCallback((key, size) => {
    setCart((prev) => {
      const item = prev.find((i) => i.key === key)
      const nextKey = `${item.id}:${size}`
      const twin = prev.find((i) => i.key === nextKey)
      if (twin) return prev.filter((i) => i !== item).map((i) => (i === twin ? { ...i, qty: Math.min(9, i.qty + item.qty) } : i))
      return prev.map((i) => (i === item ? { ...i, key: nextKey, size } : i))
    })
  }, [])

  const shared = { lang, onQuickAdd: addToCart, wishlist, onToggleWish: toggleWish }

  return (
    <MotionConfig reducedMotion="user">
      <Header
        lang={lang}
        onLangChange={setLang}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onSearch={(q) => console.info('search:', q)}
      />

      <main id="main">
        <Hero
          lang={lang}
          scrollTarget="#corset-edit"
          desktop={HERO_DESKTOP}
          mobile={HERO_MOBILE}
          ready={!introOpen}
        />

        <ProductShowcase
          id="corset-edit"
          eyebrow={h.corsetEyebrow}
          title={h.corsetTitle}
          products={corsetEdit}
          columns={3}
          viewAllHref="/collections/corset-edit"
          {...shared}
        />

        <Banner video="/media/banner.mp4" poster="/media/banner.jpg" />

        <ProductShowcase
          id="all-products"
          eyebrow={h.allEyebrow}
          title={h.allTitle}
          products={allProducts}
          columns={4}
          viewAllHref="/shop"
          footerButton={{ label: h.allButton, href: '/shop' }}
          {...shared}
        />
      </main>

      <Footer lang={lang} onLangChange={setLang} onSubscribe={(data) => console.info('subscribe:', data)} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        lang={lang}
        onQtyChange={setQty}
        onSizeChange={setSize}
        onRemove={removeItem}
      />

      {introOpen && <Intro lang={lang} desktop={HERO_DESKTOP} mobile={HERO_MOBILE} onDone={finishIntro} />}

      <AnimatePresence>
        {regionOpen && <RegionModal lang={lang} onChoose={chooseRegion} onClose={closeRegion} />}
      </AnimatePresence>
    </MotionConfig>
  )
}
