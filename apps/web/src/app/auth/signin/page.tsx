'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') ?? '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleCredentials(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await signIn('credentials', {
            email,
            password,
            callbackUrl,
            redirect: false,
        });
        setLoading(false);
        if (res?.error) {
            setError('Invalid email or password');
        } else if (res?.url) {
            window.location.href = res.url;
        }
    }

    return (
        <div className="mx-auto max-w-sm px-4 py-16">
            <h1 className="mb-8 text-center text-2xl font-bold text-[var(--portal-color-text)]">
                Sign In
            </h1>

            {/* GitHub OAuth */}
            <button
                onClick={() => signIn('github', { callbackUrl })}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--portal-color-border)]
                   bg-[var(--portal-color-surface)] px-4 py-3 text-sm font-medium text-[var(--portal-color-text)]
                   transition-colors hover:border-[var(--portal-color-primary)]"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
            </button>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--portal-color-border)]" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-[var(--portal-color-background)] px-2 text-[var(--portal-color-text-secondary)]">
                        or continue with email
                    </span>
                </div>
            </div>

            {/* Credentials */}
            <form onSubmit={handleCredentials} className="space-y-4">
                {error && (
                    <p className="rounded-md bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </p>
                )}
                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]
                           px-3 py-2 text-sm text-[var(--portal-color-text)]
                           focus:border-[var(--portal-color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--portal-color-primary)]"
                        placeholder="admin@portal.dev"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]
                           px-3 py-2 text-sm text-[var(--portal-color-text)]
                           focus:border-[var(--portal-color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--portal-color-primary)]"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[var(--portal-color-primary)] px-4 py-2.5 text-sm font-medium text-white
                       transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? 'Signing in…' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
