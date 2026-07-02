'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { getCategories } from '@/lib/api';
import type { ViatorCategory } from '@/lib/types';

const SORT_OPTIONS = [
  { value: 'TOP_RATED', label: 'Top Rated' },
  { value: 'PRICE_ASC', label: 'Price: Low to High' },
  { value: 'PRICE_DESC', label: 'Price: High to Low' },
  { value: 'NEWEST', label: 'Newest' },
];

export default function SearchFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [cats, setCats] = useState<ViatorCategory[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentCat = params.get('catId') || '';
  const currentSort = params.get('sortOrder') || 'TOP_RATED';
  const currentMin = params.get('lowestPrice') || '';
  const currentMax = params.get('highestPrice') || '';

  useEffect(() => {
    getCategories().then(setCats).catch(() => {});
  }, []);

  function applyFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`/search?${next.toString()}`);
  }

  function clearAll() {
    const q = params.get('q') || '';
    const destId = params.get('destId') || '';
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (destId) next.set('destId', destId);
    router.push(`/search?${next.toString()}`);
  }

  const hasFilters = currentCat || currentMin || currentMax || (currentSort && currentSort !== 'TOP_RATED');

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--nv-text-muted)' }}>
          Sort by
        </p>
        <div className="space-y-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => applyFilter('sortOrder', o.value)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition"
              style={{
                fontWeight: currentSort === o.value ? 700 : 400,
                background: currentSort === o.value ? 'rgba(40,104,127,0.08)' : 'transparent',
                color: currentSort === o.value ? 'var(--nv-blue-slate)' : 'var(--nv-text-body)',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      {cats.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--nv-text-muted)' }}>
            Category
          </p>
          <div className="space-y-1">
            {cats.map((c) => (
              <button
                key={c.id}
                onClick={() => applyFilter('catId', currentCat === String(c.id) ? '' : String(c.id))}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition"
                style={{
                  fontWeight: currentCat === String(c.id) ? 700 : 400,
                  background: currentCat === String(c.id) ? 'rgba(40,104,127,0.08)' : 'transparent',
                  color: currentCat === String(c.id) ? 'var(--nv-blue-slate)' : 'var(--nv-text-body)',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--nv-text-muted)' }}>
          Price range
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentMin}
            onBlur={(e) => applyFilter('lowestPrice', e.target.value)}
            className="nv-input text-sm"
            style={{ padding: '6px 10px' }}
          />
          <span style={{ color: 'var(--nv-text-muted)' }}>–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentMax}
            onBlur={(e) => applyFilter('highestPrice', e.target.value)}
            className="nv-input text-sm"
            style={{ padding: '6px 10px' }}
          />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-sm transition"
          style={{ color: 'var(--nv-cherry-rose)' }}
        >
          <X size={13} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div
          className="rounded-2xl p-5 sticky top-24"
          style={{ background: 'white', border: '1px solid var(--nv-border-hair)', boxShadow: 'var(--nv-shadow-sm)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal size={16} style={{ color: 'var(--nv-blue-slate)' }} />
            <h3 className="font-bold text-sm" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
              Filters
            </h3>
          </div>
          <FilterPanel />
        </div>
      </aside>

      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition"
          style={{ borderColor: 'var(--nv-border)', color: 'var(--nv-text-body)' }}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && (
            <span
              className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
              style={{ background: 'var(--nv-blue-slate)' }}
            >
              •
            </span>
          )}
        </button>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="relative ml-auto w-72 h-full bg-white overflow-y-auto p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
                  Filters
                </h3>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={20} style={{ color: 'var(--nv-text-muted)' }} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
