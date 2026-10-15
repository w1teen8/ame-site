/** URL of a file in /public that also works when the site lives in a subfolder (GitHub Pages). */
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
