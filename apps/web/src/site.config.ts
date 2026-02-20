import { defineConfig } from '@portal/config';

const siteConfig = defineConfig({
    site: {
        title: 'Portal',
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
    about: {
        name: 'Rick',
        bio: 'A developer passionate about building elegant solutions with TypeScript, React, and modern web technologies.',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Rick&backgroundColor=b6e3f4',
        skills: [
            'TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL',
            'Prisma', 'tRPC', 'Tailwind CSS', 'Docker', 'Git',
        ],
        socialLinks: [
            { label: 'GitHub', href: 'https://github.com', icon: '🐙' },
            { label: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
            { label: 'Email', href: 'mailto:admin@portal.dev', icon: '📧' },
        ],
    },
});

export default siteConfig;
