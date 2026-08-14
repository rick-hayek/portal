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
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#0a0d14',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
          padding: '70px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Logo Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              }}
            >
              <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#ffffff' }}>
                {'</>'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.02em' }}>
                {siteConfig.site.title}
              </span>
              <span style={{ fontSize: '18px', color: '#818cf8', fontWeight: '500' }}>
                voocii.com
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: '10px 20px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <span style={{ fontSize: '16px', color: '#cbd5e1', fontWeight: '500' }}>
              Full-Stack Personal Portal
            </span>
          </div>
        </div>

        {/* Center Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '1000px',
          }}
        >
          <h1
            style={{
              fontSize: '68px',
              fontWeight: '900',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: 0,
              background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {siteConfig.site.title} — {siteConfig.site.description}
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Modular, high-performance personal website & portfolio platform with dynamic layout engine.
          </p>
        </div>

        {/* Bottom Tech Stack Tags */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
          }}
        >
          {['Next.js 16', 'tRPC', 'Prisma', 'Tailwind CSS v4', 'TypeScript', 'i18n'].map((tech) => (
            <div
              key={tech}
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
