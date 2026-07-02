import Link from 'next/link';
import Image from 'next/image';

const LINKS = {
  Explore: [
    { href: '/search', label: 'All Experiences' },
    { href: '/search?sortOrder=TOP_RATED', label: 'Top Rated' },
    { href: '/search?catId=1', label: 'Tours & Sightseeing' },
    { href: '/search?catId=4', label: 'Food & Drink' },
    { href: '/search?catId=5', label: 'Outdoor Adventures' },
  ],
  Support: [
    { href: '/help', label: 'Help Centre' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/faq', label: 'FAQ' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--nv-surface-darker)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo-white.png"
                alt="Hero Explorer"
                width={509}
                height={118}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Discover and book extraordinary travel experiences around the
              world, powered by Viator.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm transition hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          <span>© Nuvho Systems Pty Ltd. All rights reserved.</span>
          <span>Powered by Viator Partner API</span>
        </div>
      </div>
    </footer>
  );
}
