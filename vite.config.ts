import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.ATLAS_BASE_PATH ?? (process.env.GITHUB_PAGES === 'true' ? '/atlas-of-empires/' : '/'),
});
