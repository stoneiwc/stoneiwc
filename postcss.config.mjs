/** @type {import('postcss-load-config').Config} */
// A custom PostCSS config replaces Next's default, which includes
// autoprefixer, so it has to be listed here to get vendor prefixes
// (e.g. -webkit-backdrop-filter for Safari 17 and earlier).
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
