// @ts-check
import { defineConfig } from 'astro/config';

// Static output (default). Deploys to Netlify with zero adapter config:
// netlify.toml builds to dist/ and Netlify serves it as a static site.
export default defineConfig({
  site: 'https://lilschema.netlify.app',
});
