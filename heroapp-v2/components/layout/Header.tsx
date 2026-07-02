'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for subtle shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Read auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem('hero_token');
    const stored = localStorage.getItem('hero_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  }

  function handleLogout() {
    localStorage.removeItem('hero_token');
    localStorage.removeItem('hero_user');
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
  }

  const navLinks = [
    { href: '/search', label: 'Experiences' },
    { href: '/search?sortOrder=TOP_RATED', label: 'Top Rated' },
    { href: '/search?catId=1', label: 'Tours' },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-shadow"
      style={{
        background: 'var(--nv-surface-dark)',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <Image
              src="/logo-white.png"
              alt="Hero Explorer"
              width={509}
              height={118}
              priority
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-4"
          >
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                size={16}
              />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search destinations, experiences..."
                className="w-full pl-9 pr-4 py-2 rounded-full text-sm bg-white/10 text-white placeholder-white/50 border border-white/15 focus:outline-none focus:border-white/40 focus:bg-white/15 transition"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition"
                >
                  <User size={15} />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <ChevronDown size={13} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User size={14} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-1.5 text-sm font-medium text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="nv-btn nv-btn--on-dark nv-btn--sm"
                >
                  Get started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-white/80 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 pb-4 pt-2 space-y-1">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-1 pb-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                  size={16}
                />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 rounded-full text-sm bg-white/10 text-white placeholder-white/50 border border-white/15 focus:outline-none"
                />
              </div>
            </form>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
