// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE } from './src/consts.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  integrations: [mdx(), react(), sitemap()],
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Font specimen screenshots live next to their MDX files.
    responsiveStyles: true,
  },
});
