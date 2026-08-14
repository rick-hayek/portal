import { ImageResponse } from 'next/og';
import siteConfig from '@/site.config';

export const runtime = 'edge';

export const alt = 'Voocii Portal - Modular Personal Website & Portfolio Platform';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#090c15',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff',
        }}
      >
        {/* Right Side Background (Navy Mesh Glow) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 82% 35%, rgba(99, 102, 241, 0.22) 0%, transparent 55%), radial-gradient(circle at 95% 85%, rgba(168, 85, 247, 0.15) 0%, transparent 45%)',
          }}
        />

        {/* Right Side Content Container */}
        <div
          style={{
            position: 'absolute',
            left: '520px',
            top: '70px',
            bottom: '60px',
            right: '70px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          {/* Main Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '52px',
                fontWeight: '900',
                lineHeight: 1.15,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                paddingLeft: '105px',
              }}
            >
              Modular personal website & portfolio platform
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '20px',
                color: '#94a3b8',
                lineHeight: 1.4,
                paddingLeft: '85px',
              }}
            >
              <div>Built with Next.js 16, tRPC, Prisma & Tailwind CSS v4.</div>
              <div>Dynamic layout engine with zero-bundle cost.</div>
            </div>
          </div>

          {/* Bottom Tech Badges - 2 Explicit Rows shifted right */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingLeft: '40px',
            }}
          >
            {/* Row 1: 4 badges */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Next.js 16', 'tRPC', 'Prisma', 'Tailwind CSS v4'].map((tech) => (
                <div
                  key={tech}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.85)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#cbd5e1',
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                  }}
                >
                  {tech}
                </div>
              ))}
            </div>

            {/* Row 2: 2 badges */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {['TypeScript', 'i18n'].map((tech) => (
                <div
                  key={tech}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.85)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#cbd5e1',
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                  }}
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left Slanted Polygon Block (Dark Charcoal) */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            bottom: '-60px',
            left: '-60px',
            width: '540px',
            background: 'linear-gradient(150deg, #1b1c20 0%, #0d0e11 100%)',
            transform: 'skewX(-14deg)',
            transformOrigin: 'bottom left',
            zIndex: 2,
          }}
        />

        {/* SVG Tapered Amber Stripe (Widens from 4px at top to 30px at bottom) */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="amberStripeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Tapered Amber Polygon shifted right next to text */}
          <polygon
            points="640,-10 649,-10 484,640 434,640"
            fill="url(#amberStripeGrad)"
          />
        </svg>

        {/* Left Content Overlay (Un-skewed text on left side) */}
        <div
          style={{
            position: 'absolute',
            left: '75px',
            top: '0px',
            bottom: '0px',
            width: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '32px',
            zIndex: 3,
          }}
        >
          {/* Logo & Sub-tag */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                }}
              >
                {'</>'}
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: '800',
                  letterSpacing: '0.22em',
                  color: '#f59e0b',
                  textTransform: 'uppercase',
                }}
              >
                PORTAL PLATFORM
              </span>
            </div>

            <div
              style={{
                fontSize: '64px',
                fontWeight: '900',
                color: '#ffffff',
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              {siteConfig.site.title}
            </div>
          </div>

          {/* Glowing Amber CTA Button */}
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#0f172a',
                fontSize: '20px',
                fontWeight: '800',
                padding: '14px 32px',
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.5)',
                letterSpacing: '-0.01em',
              }}
            >
              Read More
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
