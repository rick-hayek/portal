import { defineConfig, defaultAboutConfig } from '@portal/config';

const siteConfig = defineConfig({
  site: {
    title: 'Voocii',
    description: 'A modular personal website platform',
    url: 'https://voocii.com',
    locale: 'en-US',
  },
  preset: 'full',
  theme: {
    default: 'minimal-light',
    available: ['minimal-light', 'dark-neon', 'cyberpunk', 'retro-brown', 'zenith', 'lumiere'],
    allowUserSwitch: true,
  },
  about: defaultAboutConfig,
});

export default siteConfig;
