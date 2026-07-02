'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, LogOut, Calendar, X } from 'lucide-react';
import { getMyBookings, getMyPastBookings, cancelHeroBooking } from '@/lib/api';
import type { HeroBookingRecord } from '@/lib/types';

interface StoredUser {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [upcoming, setUpcoming] = useState<HeroBookingRecord[]>([]);
  const [past, setPast] = useState<HeroBookingRecord[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hero_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    try { setUser(JSON.parse(stored)); } catch { router.push('/login'); }
  }, [router]);

  useEffect(() => {
    if (!user?.email) return;
    setBookingsLoading(true);
    setBookingsError(null);
    Promise.all([getMyBookings(user.email), getMyPastBookings(user.email)])
      .then(([up, prev]) => {
        setUpcoming(up);
        setPast(prev);
      })
      .catch((err: unknown) => {
        setBookingsError(err instanceof Error ? err.message : 'Could not load your bookings.');
      })
      .finally(() => setBookingsLoading(false));
  }, [user?.email]);

  async function handleCancel(itineraryId: string) {
    setCancellingId(itineraryId);
    try {
      await cancelHeroBooking(itineraryId);
      setUpcoming((rows) => rows.filter((b) => b.itineraryId !== itineraryId));
    } catch (err: unknown) {
      setBookingsError(err instanceof Error ? err.message : 'Could not cancel this booking.');
    } finally {
      setCancellingId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem('hero_token');
    localStorage.removeItem('hero_user');
    router.push('/');
  }

  if (!user) return null;

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ background: 'var(--nv-surface-page)' }}
    >
      <div className="max-w-lg mx-auto">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
        >
          My Profile
        </h1>

        <div
          className="rounded-2xl p-6 mb-4"
          style={{ background: 'white', boxShadow: 'var(--nv-shadow-sm)', border: '1px solid var(--nv-border-hair)' }}
        >
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--nv-border-hair)' }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ background: 'var(--nv-blue-slate)', fontFamily: 'var(--font-comfortaa)' }}
            >
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </p>
              <p className="text-sm" style={{ color: 'var(--nv-text-muted)' }}>Hero Explorer member</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={16} style={{ color: 'var(--nv-steel-blue)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>Email</p>
                <p className="text-sm font-medium" style={{ color: 'var(--nv-text-body)' }}>{user.email}</p>
              </div>
            </div>
            {(user.firstName || user.lastName) && (
              <div className="flex items-center gap-3">
                <User size={16} style={{ color: 'var(--nv-steel-blue)' }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>Full name</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--nv-text-body)' }}>
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="rounded-2xl p-6 mb-4"
          style={{ background: 'white', boxShadow: 'var(--nv-shadow-sm)', border: '1px solid var(--nv-border-hair)' }}
        >
          <h2
            className="text-lg font-bold mb-4"
            style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
          >
            My bookings
          </h2>

          {bookingsError && (
            <div
              className="p-3 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(152,38,73,0.08)', color: 'var(--nv-cherry-rose)' }}
            >
              {bookingsError}
            </div>
          )}

          {bookingsLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--nv-platinum)' }} />
              ))}
            </div>
          ) : upcoming.length === 0 && past.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--nv-text-muted)' }}>
              You don&apos;t have any bookings yet.
            </p>
          ) : (
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--nv-text-muted)' }}>Upcoming</p>
                  <div className="space-y-3">
                    {upcoming.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl"
                        style={{ background: 'var(--nv-surface-page)' }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--nv-text-body)' }}>
                            {b.productTitle || b.productCode}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--nv-text-muted)' }}>
                            {b.travelDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {new Date(b.travelDate).toLocaleDateString()}
                              </span>
                            )}
                            {b.chargedPrice != null && (
                              <span>{b.currency} {Number(b.chargedPrice).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancel(b.itineraryId)}
                          disabled={cancellingId === b.itineraryId}
                          className="flex items-center gap-1 text-xs font-medium shrink-0 transition"
                          style={{ color: 'var(--nv-cherry-rose)', opacity: cancellingId === b.itineraryId ? 0.5 : 1 }}
                        >
                          <X size={12} /> {cancellingId === b.itineraryId ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--nv-text-muted)' }}>Past & cancelled</p>
                  <div className="space-y-3">
                    {past.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl"
                        style={{ background: 'var(--nv-surface-page)', opacity: 0.75 }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--nv-text-body)' }}>
                            {b.productTitle || b.productCode}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--nv-text-muted)' }}>
                            {b.travelDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {new Date(b.travelDate).toLocaleDateString()}
                              </span>
                            )}
                            {b.isCancel === 1 && <span style={{ color: 'var(--nv-cherry-rose)' }}>Cancelled</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium transition"
          style={{ color: 'var(--nv-cherry-rose)' }}
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}
