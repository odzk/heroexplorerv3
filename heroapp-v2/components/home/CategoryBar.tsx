'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories } from '@/lib/api';
import type { ViatorCategory } from '@/lib/types';
import { Compass, Utensils, Mountain, Camera, Music, Ship, Bike, Star } from 'lucide-react';

// Fallback icons mapped by keyword
const iconMap: Record<string, React.ReactNode> = {
  tour:       <Compass size={22} />,
  food:       <Utensils size={22} />,
  outdoor:    <Mountain size={22} />,
  nature:     <Mountain size={22} />,
  photo:      <Camera size={22} />,
  show:       <Music size={22} />,
  cruise:     <Ship size={22} />,
  bike:       <Bike size={22} />,
  default:    <Star size={22} />,
};

function getIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return icon;
  }
  return iconMap.default;
}

export default function CategoryBar() {
  const router = useRouter();
  const [cats, setCats] = useState<ViatorCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => setCats(data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-24 h-20 rounded-xl animate-pulse"
              style={{ background: 'var(--nv-platinum)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!cats.length) return null;

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="nv-section-title mb-6">Browse by Category</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {cats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/search?catId=${cat.id}`)}
              className="flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition group"
              style={{
                borderColor: 'var(--nv-border)',
                background: 'white',
                minWidth: '90px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--nv-surface-dark)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--nv-blue-slate)';
                (e.currentTarget as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'white';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--nv-border)';
                (e.currentTarget as HTMLButtonElement).style.color = '';
              }}
            >
              <span style={{ color: 'var(--nv-blue-slate)' }} className="group-hover:text-white transition">
                {getIcon(cat.name)}
              </span>
              <span
                className="text-xs font-semibold text-center leading-tight"
                style={{ fontFamily: 'var(--font-comfortaa)', color: 'inherit', maxWidth: '72px' }}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
