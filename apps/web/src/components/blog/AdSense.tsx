'use client';

import { useEffect } from 'react';

export function AdSense() {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense initialization error:', e);
    }
  }, []);

  return (
    <div className="my-6 overflow-hidden text-center" style={{ minHeight: '100px' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-5960009177449604"
        data-ad-slot="4765375541"
      />
    </div>
  );
}
