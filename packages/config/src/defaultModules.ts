import { registerModule } from './moduleRegistry';

export function registerDefaultModules() {
  registerModule({
    id: 'blog',
    name: 'Blog',
    icon: '📝',
    version: '1.0.0',
    routes: [{ path: '/blog', label: 'Blog' }],
    navItems: [{ label: 'Blog', href: '/blog', icon: '📝', order: 1 }],
  });
  registerModule({
    id: 'portfolio',
    name: 'Portfolio',
    icon: '🚀',
    version: '1.0.0',
    routes: [{ path: '/portfolio', label: 'Portfolio' }],
    navItems: [{ label: 'Portfolio', href: '/portfolio', icon: '🚀', order: 2 }],
  });
  registerModule({
    id: 'books',
    name: 'Books',
    icon: '📚',
    version: '1.0.0',
    routes: [{ path: '/books', label: 'Books' }],
    navItems: [{ label: 'Books', href: '/books', icon: '📚', order: 3 }],
  });
  registerModule({
    id: 'resume',
    name: 'Resume',
    icon: '📄',
    version: '1.0.0',
    routes: [{ path: '/resume', label: 'Resume' }],
    navItems: [{ label: 'Resume', href: '/resume', icon: '📄', order: 4 }],
  });
  registerModule({
    id: 'gallery',
    name: 'Gallery',
    icon: '🖼️',
    version: '1.0.0',
    routes: [{ path: '/gallery', label: 'Gallery' }],
    navItems: [{ label: 'Gallery', href: '/gallery', icon: '🖼️', order: 5 }],
  });
  registerModule({
    id: 'guestbook',
    name: 'Guestbook',
    icon: '💬',
    version: '1.0.0',
    routes: [{ path: '/guestbook', label: 'Guestbook' }],
    navItems: [{ label: 'Guestbook', href: '/guestbook', icon: '💬', order: 6 }],
  });
  registerModule({
    id: 'links',
    name: 'Links',
    icon: '🔗',
    version: '1.0.0',
    routes: [{ path: '/links', label: 'Links' }],
    navItems: [{ label: 'Links', href: '/links', icon: '🔗', order: 7 }],
  });
  registerModule({
    id: 'about',
    name: 'About',
    icon: '👤',
    version: '1.0.0',
    routes: [{ path: '/about', label: 'About' }],
    navItems: [{ label: 'About', href: '/about', icon: '👤', order: 8 }],
  });
  registerModule({
    id: 'tools',
    name: 'Tools',
    icon: '🛠️',
    version: '1.0.0',
    routes: [{ path: '/tools', label: 'Tools' }],
    navItems: [{ label: 'Tools', href: '/tools', icon: '🛠️', order: 9 }],
  });
}
