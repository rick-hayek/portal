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
        <div className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-[var(--portal-color-background)] px-4 py-12 sm:px-6 lg:px-8">
            {/* Ambient Background Mesh */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--portal-color-primary)] opacity-[0.03] blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-[var(--portal-color-accent)] opacity-[0.02] blur-3xl" />
            </div>

            {/* Layout Refinement: Single 320px container for everything */}
            <div className="relative w-full max-w-[320px] space-y-6">
                <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--portal-color-primary)] text-white shadow-lg shadow-[var(--portal-color-primary)]/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[var(--portal-color-text)] font-heading">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-[0.95rem] text-[var(--portal-color-text-secondary)]">
                        Sign in to your Portal account
                    </p>
                </div>

                <div className="mt-6">
                    {/* GitHub OAuth */}
                    <button
                        onClick={() => signIn('github', { callbackUrl })}
                        className="group flex w-full items-center justify-center gap-3 rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] h-11 text-[0.9rem] font-medium text-[var(--portal-color-text)] transition-all hover:border-[var(--portal-color-text-tertiary)] hover:bg-[var(--portal-color-surface-alt)]"
                    >
                        <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Continue with GitHub
                    </button>

                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--portal-color-border-soft)]" />
                        </div>
                        <div className="relative flex justify-center text-[0.7rem] font-bold tracking-wider uppercase">
                            <span className="bg-[var(--portal-color-background)] px-3 text-[var(--portal-color-text-tertiary)]">
                                OR
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleCredentials} className="space-y-4">
                        {error && (
                            <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input-base rounded-xl"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input-base rounded-xl"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        {/* Spacing increased to separate password input from sign in button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center rounded-full bg-[var(--portal-color-text)] h-11 text-[0.9rem] font-bold text-white shadow-lg shadow-[var(--portal-color-text)]/20 transition-all hover:opacity-90 hover:translate-y-[-1px] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin text-white/80" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verify...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
// Rebuild trigger 2
