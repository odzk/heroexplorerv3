'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await register(form);
      localStorage.setItem('hero_token', token);
      localStorage.setItem('hero_user', JSON.stringify(user));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--nv-surface-page)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: 'white', boxShadow: 'var(--nv-shadow-md)' }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
        >
          Create an account
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--nv-text-muted)' }}>
          Start exploring extraordinary experiences
        </p>

        {error && (
          <div
            className="p-3 rounded-xl mb-4 text-sm"
            style={{ background: 'rgba(152,38,73,0.08)', color: 'var(--nv-cherry-rose)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--nv-text-muted)' }}>
                First name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="nv-input"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--nv-text-muted)' }}>
                Last name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="nv-input"
                placeholder="Smith"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--nv-text-muted)' }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="nv-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--nv-text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="nv-input"
              placeholder="At least 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="nv-btn nv-btn--solid nv-btn--lg w-full justify-center"
            style={{ display: 'flex', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--nv-text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--nv-blue-slate)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
