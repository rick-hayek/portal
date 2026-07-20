import { defineConfig, defaultAboutConfig } from '@portal/config';

const siteConfig = defineConfig({
  site: {
    title: 'Voocii',
    description: 'A modular personal website platform',
    url: 'https://portal.dev',
    locale: 'en-US',
  },
  preset: 'full',
  theme: {
    default: 'minimal-light',
    available: ['minimal-light', 'dark-neon', 'cyberpunk', 'nature-green', 'retro-brown'],
    allowUserSwitch: true,
  },
  about: defaultAboutConfig,
});

export default siteConfig;
