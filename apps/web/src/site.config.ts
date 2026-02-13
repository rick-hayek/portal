import { defineConfig } from '@portal/config';

export default defineConfig({
    site: {
        title: 'Portal',
        description: 'A modular personal website platform',
        url: 'https://portal.dev',
        locale: 'en-US',
    },
    preset: 'tech-blog',
    theme: {
        default: 'minimal-light',
        available: ['minimal-light', 'dark-neon', 'cyberpunk', 'nature-green', 'retro-brown'],
        allowUserSwitch: true,
    },
    admin: {
        enabled: true,
        basePath: '/admin',
    },
});
