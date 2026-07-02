'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import ExperienceCard from '@/components/search/ExperienceCard';
import SearchFilters from '@/components/search/SearchFilters';
import { searchExperiences, getDestinations } from '@/lib/api';
import type { ViatorProduct, SearchParams } from '@/lib/types';

const PER_PAGE = 12;

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<ViatorProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [destName, setDestName] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(params.get('q') || '');

  const page = parseInt(params.get('page') || '1', 10);

  useEffect(() => {
    const searchParams: SearchParams = {
      perPage: PER_PAGE,
      page,
    };
    const q = params.get('q');
    const destId = params.get('destId');
    const catId = params.get('catId');
    const sortOrder = params.get('sortOrder') as SearchParams['sortOrder'];
    const lowestPrice = params.get('lowestPrice');
    const highestPrice = params.get('highestPrice');

    if (q) searchParams.searchTerm = q;
    if (destId) {
      const id = parseInt(destId, 10);
      searchParams.destId = id;
      // Resolve destination name from Viator /destinations?destId=X
      getDestinations(id)
        .then((dests) => {
          const match = Array.isArray(dests)
            ? dests.find((d) => d.destinationId === id) ?? dests[0]
            : (dests as { destinationId: number; destinationName: string })?.destinationId === id
              ? (dests as { destinationName: string })
              : null;
          setDestName(match?.destinationName ?? null);
        })
        .catch(() => setDestName(null));
    } else {
      setDestName(null);
    }
    if (catId) searchParams.catId = parseInt(catId, 10);
    if (sortOrder) searchParams.sortOrder = sortOrder;
    if (lowestPrice) searchParams.lowestPrice = parseFloat(lowestPrice);
    if (highestPrice) searchParams.highestPrice = parseFloat(highestPrice);

    setLoading(true);
    searchExperiences(searchParams)
      .then(({ products, totalCount }) => {
        setProducts(products);
        setTotal(totalCount);
      })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [params, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  function goPage(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(p));
    router.push(`/search?${next.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(total / PER_PAGE);
  const q = params.get('q') || '';
  const heading = destName
    ? `Experiences in ${destName}`
    : q
    ? `Results for "${q}"`
    : 'All Experiences';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--nv-text-muted)' }} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search destinations, experiences..."
              className="nv-input pl-9"
            />
          </div>
          <button type="submit" className="nv-btn nv-btn--solid nv-btn--md">
            Search
          </button>
        </form>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
          {heading}
        </h1>
        {!loading && (
          <p className="text-sm mt-1" style={{ color: 'var(--nv-text-muted)' }}>
            {total.toLocaleString()} experience{total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <div className="flex gap-8">
        <SearchFilters />

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl h-40 animate-pulse" style={{ background: 'var(--nv-platinum)' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--nv-text-muted)' }}>
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
                No experiences found
              </p>
              <p className="text-sm">Try a different destination or adjust your filters.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {products.map((p) => (
                  <ExperienceCard key={p.productCode} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    disabled={page <= 1}
                    onClick={() => goPage(page - 1)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition disabled:opacity-40"
                    style={{ borderColor: 'var(--nv-border)', color: 'var(--nv-text-body)' }}
                  >
                    Previous
                  </button>
                  <span className="text-sm" style={{ color: 'var(--nv-text-muted)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => goPage(page + 1)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition disabled:opacity-40"
                    style={{ borderColor: 'var(--nv-border)', color: 'var(--nv-text-body)' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center" style={{ color: 'var(--nv-text-muted)' }}>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
