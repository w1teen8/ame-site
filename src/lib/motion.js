// Single easing curve for the whole storefront: fast start, long silky settle.
export const EASE = [0.22, 1, 0.36, 1]

export const transition = (duration = 0.6, delay = 0) => ({ duration, ease: EASE, delay })
