'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X } from 'lucide-react';
import { searchDestinations } from '@/lib/api';
import type { ViatorDestination } from '@/lib/types';

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ViatorDestination[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchDestinations(query);
        setSuggestions(results.slice(0, 6));
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  }

  function selectDestination(d: ViatorDestination) {
    router.push(`/search?destId=${d.destinationId}&q=${encodeURIComponent(d.destinationName)}`);
    setShowSuggestions(false);
  }

  return (
    <section
      className="relative flex items-center justify-center text-white overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(20,30,28,0.72) 0%, rgba(31,58,79,0.6) 60%, rgba(45,107,99,0.55) 100%), url(/home-header-bg-1.jpeg)',
        minHeight: '520px',
      }}
    >

      <div className="relative z-10 text-center px-4 w-full max-w-3xl mx-auto py-20">
        {/* Search box */}
        <div ref={wrapRef} className="relative mx-auto max-w-xl">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white rounded-full shadow-xl overflow-hidden"
          >
            <MapPin
              className="ml-4 flex-shrink-0"
              size={18}
              color="var(--nv-blue-slate)"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Where do you want to go?"
              className="flex-1 px-3 py-4 text-gray-800 text-base outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="m-1.5 px-6 py-2.5 rounded-full font-semibold text-white text-sm transition"
              style={{ background: 'var(--nv-blue-slate)', fontFamily: 'var(--font-comfortaa)' }}
            >
              <Search size={14} className="inline mr-1.5" />Search
            </button>
          </form>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden z-50 text-left">
              {suggestions.map((d) => (
                <li key={d.destinationId}>
                  <button
                    onClick={() => selectDestination(d)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                  >
                    <MapPin size={14} color="var(--nv-steel-blue)" className="flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {d.destinationName}
                      </span>
                      {d.parentDestinationName && (
                        <span className="text-xs text-gray-400 ml-2">
                          {d.parentDestinationName}
                        </span>
                      )}
                    </div>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--nv-platinum)',
                        color: 'var(--nv-text-muted)',
                      }}
                    >
                      {d.destinationType}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {['Paris', 'Bali', 'Tokyo', 'Sydney', 'New York', 'Rome'].map((city) => (
            <button
              key={city}
              onClick={() => router.push(`/search?q=${city}`)}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-white/80 hover:text-white border border-white/25 hover:border-white/50 hover:bg-white/10 transition"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
