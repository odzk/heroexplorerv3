import { Suspense } from 'react';
import HeroSearch from '@/components/home/HeroSearch';
import CategoryBar from '@/components/home/CategoryBar';
import DestinationGrid from '@/components/home/DestinationGrid';
import FeaturedExperiences from '@/components/home/FeaturedExperiences';
import { ShieldCheck, Headphones, CreditCard } from 'lucide-react';

function TrustBar() {
  const items = [
    {
      icon: <ShieldCheck size={22} />,
      title: 'Secure booking',
      desc: 'Your payment is protected',
    },
    {
      icon: <Headphones size={22} />,
      title: '24/7 support',
      desc: 'Here whenever you need us',
    },
    {
      icon: <CreditCard size={22} />,
      title: 'Free cancellation',
      desc: 'On most experiences',
    },
  ];

  return (
    <section className="py-8 bg-white border-b" style={{ borderColor: 'var(--nv-border-hair)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div
                className="flex-shrink-0 p-3 rounded-xl"
                style={{ background: 'var(--nv-surface-page)', color: 'var(--nv-blue-slate)' }}
              >
                {item.icon}
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
                >
                  {item.title}
                </p>
                <p className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <TrustBar />
      <Suspense fallback={null}>
        <CategoryBar />
      </Suspense>
      <Suspense fallback={null}>
        <DestinationGrid />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedExperiences />
      </Suspense>
    </>
  );
}
