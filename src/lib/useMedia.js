import { useEffect, useState } from 'react'

export const MOBILE_QUERY = '(max-width: 767px)'
export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

/** Live boolean for a CSS media query. */
export function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Portrait clip on phones, landscape elsewhere. */
export function useHeroMedia(desktop, mobile) {
  const isMobile = useMedia(MOBILE_QUERY)
  return (isMobile && mobile) || desktop
}
