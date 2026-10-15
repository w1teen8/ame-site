// Catalogue built from @ame.ukraine posts (photos in public/products, taken
// from the saved Instagram pages in /gallery). Names, prices and sizes come
// from the post captions; sets are priced as the sum of their pieces.
//
// image:      main photo; hoverImage: second shot of the same piece (optional —
//             without it the photo just zooms on hover).
// sizes:      [label, inStock] pairs.
// oldPrice:   set when the piece is discounted.
// soldOut:    no quick action, ribbon over the photo.

const sizes = (list, missing = []) => list.map((s) => [s, !missing.includes(s)])
const XXS_L = ['XXS', 'XS', 'S', 'M', 'L']
const XXS_M = ['XXS', 'XS', 'S', 'M']
const XS_L = ['XS', 'S', 'M', 'L']
const XS_M = ['XS', 'S', 'M']

const item = (id, name, price, extra = {}) => ({
  id,
  name,
  href: `/product/${id}`,
  price,
  image: `/products/${id}.jpg`,
  ...(extra.detail === false ? {} : { hoverImage: `/products/${id}-detail.jpg` }),
  ...extra,
})

const solo = { detail: false }

const p = {
  swan: item('swan', 'Dress Swan', 7000, { sizes: sizes(XXS_M) }),
  ameliaPowder: item('amelia-powder', 'Amelia Satin Set — Powder', 6300, { sizes: sizes(XXS_L) }),
  ameliaMilk: item('amelia-milk', 'Amelia Satin Set — Milk', 6300, { sizes: sizes(XXS_L) }),
  whiteRose: item('white-rose', 'Set White Rose', 6500, { ...solo, sizes: sizes(XXS_L) }),
  pinkStones: item('pink-stones', 'Pink Set with Stones', 7000, { ...solo, sizes: sizes(XS_M) }),
  satinCorset: item('satin-corset', 'Satin Corset', 3500, { ...solo, badge: 'New', sizes: sizes(XXS_M) }),

  ariel: item('ariel', 'Ariel Dress', 4600, { sizes: sizes(XXS_L) }),
  lily: item('lily', 'Lily Dress', 4000, { sizes: sizes(XS_L) }),
  elegance: item('elegance', 'Dress Élégance', 3500, { sizes: sizes(XS_L) }),
  littleBlack: item('little-black-dress', 'Little Black Dress', 4800, { sizes: sizes(XXS_L) }),
  setParis: item('set-paris', 'Set Paris', 4350, { sizes: sizes(XS_L) }),
  peach: item('peach-set', 'Peach Set', 8200, { sizes: sizes(XXS_L) }),
  blazerDress: item('blazer-dress', 'Blazer Dress', 5500, { sizes: sizes(XS_L) }),
  // soldOut here only demonstrates the ribbon — set it from real stock.
  blazerWhite: item('blazer-dress-white', 'Blazer Dress White', 5800, { ...solo, soldOut: true, sizes: sizes(XS_L, XS_L) }),
  rosie: item('rosie', 'Jacket Rosie', 5500, { ...solo, sizes: sizes(XS_L) }),
  sophi: item('sophi', 'Jacket-Coat Sophi', 6000, { ...solo, sizes: sizes(XXS_M) }),
  coat: item('double-breasted-coat', 'Double-breasted Coat', 9500, { ...solo, sizes: sizes(XXS_L) }),
  bomber: item('bomber-set', 'Bomber Set', 6900, { ...solo, sizes: sizes(XS_L) }),
}

/** First showcase — the corset line, 3 per row. */
export const corsetEdit = [p.swan, p.ameliaPowder, p.whiteRose, p.pinkStones, p.ameliaMilk, p.satinCorset]

/** Second showcase — the rest of the catalogue, 4 per row. */
export const allProducts = [
  p.ariel, p.lily, p.elegance, p.littleBlack,
  p.setParis, p.peach, p.blazerDress, p.blazerWhite,
  p.rosie, p.sophi, p.coat, p.bomber,
]

/** Every piece by id — used to rebuild the saved bag. */
export const productsById = Object.fromEntries(Object.values(p).map((x) => [x.id, x]))
