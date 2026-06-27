import { defineConfig } from '@portal/config';

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
  about: {
    name: 'Rick',
    bio: 'A developer passionate about building elegant solutions with TypeScript, React, and modern web technologies.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Rick&backgroundColor=b6e3f4',
    skills: [
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'PostgreSQL',
      'Prisma',
      'tRPC',
      'Tailwind CSS',
      'Docker',
      'Git',
    ],
    socialLinks: [
      {
        label: 'GitHub',
        href: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/',
        icon: '🐙',
      },
      {
        label: 'Twitter',
        href: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com',
        icon: '🐦',
      },
      {
        label: 'Email',
        href: process.env.NEXT_PUBLIC_EMAIL
          ? `mailto:${process.env.NEXT_PUBLIC_EMAIL}`
          : 'mailto:[EMAIL_ADDRESS]',
        icon: '📧',
      },
    ],
  },
});

export default siteConfig;
