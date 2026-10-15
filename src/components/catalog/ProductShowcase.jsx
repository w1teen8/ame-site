import { motion } from 'framer-motion'
import { dict } from '../../lib/i18n'
import { transition } from '../../lib/motion'
import Button from '../ui/Button'
import ProductCard from './ProductCard'

const heading = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: transition(0.9) },
}

const GRID = {
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-3 lg:grid-cols-4',
}

/**
 * Titled product grid: heading with a "View all" button on the right, then
 * the cards. Phones always get two columns.
 *
 * @param {3|4} [columns=4]
 * @param {{label, href}} [footerButton]  Optional centred button under the grid.
 */
export default function ProductShowcase({
  id,
  eyebrow,
  title,
  products,
  columns = 4,
  viewAllHref,
  footerButton,
  lang = 'ua',
  onQuickAdd,
  wishlist,
  onToggleWish,
}) {
  const t = dict[lang].catalog
  const titleId = `${id}-title`

  return (
    <section id={id} aria-labelledby={titleId} className="bg-ecru px-4 py-16 md:px-8 md:py-24 xl:px-12">
      <div className="mx-auto max-w-[1440px]">
        <motion.div
          variants={heading}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          className="mb-8 flex items-end justify-between gap-6 md:mb-12"
        >
          <div>
            {eyebrow && <p className="text-[10px] tracking-[0.24em] text-mist uppercase md:text-[11px]">{eyebrow}</p>}
            <h2 id={titleId} className="mt-3 font-display text-[36px] leading-none text-graphite md:mt-4 md:text-[56px]">
              {title}
            </h2>
          </div>
          {viewAllHref && (
            <Button href={viewAllHref} className="max-md:h-10 max-md:px-4">
              {t.viewAll}
            </Button>
          )}
        </motion.div>

        <ul className={`grid grid-cols-2 gap-x-3 gap-y-6 md:gap-5 lg:gap-6 ${GRID[columns]}`}>
          {products.map((product, i) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                lang={lang}
                index={i}
                onQuickAdd={onQuickAdd}
                wished={wishlist?.has(product.id)}
                onToggleWish={onToggleWish}
              />
            </li>
          ))}
        </ul>

        {footerButton && (
          <div className="mt-12 flex justify-center md:mt-16">
            <Button href={footerButton.href}>{footerButton.label}</Button>
          </div>
        )}
      </div>
    </section>
  )
}
