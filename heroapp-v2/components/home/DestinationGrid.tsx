'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, ArrowRight } from 'lucide-react';
import { getDestinations } from '@/lib/api';
import type { ViatorDestination } from '@/lib/types';

// Curated Unsplash photos keyed by lowercase city / region name
const DEST_IMAGES: Record<string, string> = {
  'paris':        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=480&q=80&auto=format&fit=crop',
  'bali':         'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=480&q=80&auto=format&fit=crop',
  'tokyo':        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=480&q=80&auto=format&fit=crop',
  'sydney':       'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=480&q=80&auto=format&fit=crop',
  'new york':     'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=480&q=80&auto=format&fit=crop',
  'new york city':'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=480&q=80&auto=format&fit=crop',
  'rome':         'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=480&q=80&auto=format&fit=crop',
  'london':       'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=480&q=80&auto=format&fit=crop',
  'barcelona':    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=480&q=80&auto=format&fit=crop',
  'amsterdam':    'https://images.unsplash.com/photo-1468890197987-8aa4b1d1f6f1?w=480&q=80&auto=format&fit=crop',
  'bangkok':      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=480&q=80&auto=format&fit=crop',
  'dubai':        'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=480&q=80&auto=format&fit=crop',
  'istanbul':     'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=480&q=80&auto=format&fit=crop',
  'singapore':    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=480&q=80&auto=format&fit=crop',
  'hong kong':    'https://images.unsplash.com/photo-1507941097613-9f2157b69235?w=480&q=80&auto=format&fit=crop',
  'miami':        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&q=80&auto=format&fit=crop',
  'los angeles':  'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=480&q=80&auto=format&fit=crop',
  'san francisco':'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=480&q=80&auto=format&fit=crop',
  'cancun':       'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=480&q=80&auto=format&fit=crop',
  'prague':       'https://images.unsplash.com/photo-1541849546-216549ae216d?w=480&q=80&auto=format&fit=crop',
  'vienna':       'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=480&q=80&auto=format&fit=crop',
  'athens':       'https://images.unsplash.com/photo-1555993539-1732b0258235?w=480&q=80&auto=format&fit=crop',
  'santorini':    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=480&q=80&auto=format&fit=crop',
  'cape town':    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=480&q=80&auto=format&fit=crop',
  'machu picchu': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=480&q=80&auto=format&fit=crop',
  'kyoto':        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=480&q=80&auto=format&fit=crop',
  'melbourne':    'https://images.unsplash.com/photo-1545044846-351ba102b6d5?w=480&q=80&auto=format&fit=crop',
  'auckland':     'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=480&q=80&auto=format&fit=crop',
  'rio de janeiro':'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=480&q=80&auto=format&fit=crop',
  'cairo':        'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=480&q=80&auto=format&fit=crop',
};

// Fallback gradients (Nuvho palette)
const GRADIENTS = [
  'linear-gradient(135deg, #1E5163, #28687F)',
  'linear-gradient(135deg, #28687F, #80B9BF)',
  'linear-gradient(135deg, #414B4C, #6BA1BF)',
  'linear-gradient(135deg, #672564, #28687F)',
  'linear-gradient(135deg, #80B9BF, #1E5163)',
  'linear-gradient(135deg, #6BA1BF, #414B4C)',
];

function getDestImage(name: string): string | null {
  return DEST_IMAGES[name.toLowerCase()] ?? null;
}

// Static fallback cities when the API returns nothing
const STATIC_DESTINATIONS = [
  { name: 'Paris',     country: 'France' },
  { name: 'Bali',      country: 'Indonesia' },
  { name: 'Tokyo',     country: 'Japan' },
  { name: 'Sydney',    country: 'Australia' },
  { name: 'New York',  country: 'USA' },
  { name: 'Rome',      country: 'Italy' },
];

export default function DestinationGrid() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<ViatorDestination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDestinations()
      .then((data) => {
        const cities = data
          .filter((d) => d.destinationType === 'CITY' || d.destinationType === 'REGION')
          .slice(0, 6);
        setDestinations(cities.length >= 3 ? cities : data.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="nv-section-title">Popular Destinations</h2>
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-1 text-sm font-semibold transition"
            style={{ color: 'var(--nv-blue-slate)', fontFamily: 'var(--font-comfortaa)' }}
          >
            View all <ArrowRight size={15} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-40 animate-pulse"
                style={{ background: 'var(--nv-platinum)' }}
              />
            ))}
          </div>
        ) : destinations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((dest, i) => {
              const imgUrl = getDestImage(dest.destinationName);
              return (
                <button
                  key={dest.destinationId}
                  onClick={() =>
                    router.push(
                      `/search?destId=${dest.destinationId}&q=${encodeURIComponent(dest.destinationName)}`,
                    )
                  }
                  className="relative rounded-2xl overflow-hidden group cursor-pointer text-left h-40 sm:h-44"
                  style={!imgUrl ? { background: GRADIENTS[i % GRADIENTS.length] } : undefined}
                >
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={dest.destinationName}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : null}
                  {/* Gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition duration-300" />

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <MapPin size={10} color="rgba(255,255,255,0.7)" />
                      <span className="text-xs text-white/70 capitalize">
                        {dest.destinationType?.toLowerCase()}
                      </span>
                    </div>
                    <p
                      className="text-white font-bold text-sm leading-tight"
                      style={{ fontFamily: 'var(--font-comfortaa)' }}
                    >
                      {dest.destinationName}
                    </p>
                    {dest.parentDestinationName && (
                      <p className="text-white/60 text-xs mt-0.5">
                        {dest.parentDestinationName}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Static fallback when API is not connected */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATIC_DESTINATIONS.map(({ name, country }, i) => {
              const imgUrl = getDestImage(name);
              return (
                <button
                  key={name}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(name)}`)}
                  className="relative rounded-2xl overflow-hidden group cursor-pointer text-left h-40 sm:h-44"
                  style={!imgUrl ? { background: GRADIENTS[i % GRADIENTS.length] } : undefined}
                >
                  {imgUrl && (
                    <Image
                      src={imgUrl}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p
                      className="text-white font-bold text-sm leading-tight"
                      style={{ fontFamily: 'var(--font-comfortaa)' }}
                    >
                      {name}
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">{country}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
