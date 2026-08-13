import { defaultAboutConfig, defineConfig } from '@portal/config';

const siteConfig = defineConfig({
  site: {
    title: 'Voocii',
    description: 'A modular personal website platform',
    url: 'https://voocii.com',
    locale: 'en-US',
  },
  preset: 'full',
  theme: {
    default: 'zenith',
    available: ['zenith', 'dark-neon', 'cyberpunk', 'retro-brown', 'minimal-light', 'lumiere'],
    allowUserSwitch: true,
  },
  homeLayout: 'classic',
  about: defaultAboutConfig,
});

export default siteConfig;
