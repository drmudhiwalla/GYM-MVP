'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Logo() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fade = Math.max(0, 1 - scrollY / 150);
      setOpacity(fade);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link href="/" className="text-logo" style={{ textDecoration: 'none', opacity }}>
      <div className="logo-title">DrMudhiwalla</div>
      <div className="logo-subtitle">HealthTech <span className="pvt-ltd">Pvt Ltd</span></div>
    </Link>
  );
}
