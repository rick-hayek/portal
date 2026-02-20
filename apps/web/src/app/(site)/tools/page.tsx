import React from 'react';
import Link from 'next/link';
import { Settings2, FileJson, Hash, Shield } from 'lucide-react';

const tools = [
    {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format, validate and prettify JSON data with syntax highlighting.',
        icon: <FileJson className="h-6 w-6" />,
        href: '/tools/json-formatter',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        id: 'base64',
        name: 'Base64 Encoder / Decoder',
        description: 'Encode to or decode from Base64 format instantly.',
        icon: <Hash className="h-6 w-6" />,
        href: '/tools/base64',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    },
    {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        description: 'Decode and inspect JSON Web Tokens inline securely.',
        icon: <Shield className="h-6 w-6" />,
        href: '/tools/jwt-decoder',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
    }
];

export default function ToolsPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-16">
            <header className="space-y-4 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--portal-color-primary)]/10 text-[var(--portal-color-primary)]">
                    <Settings2 className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-[var(--portal-color-text)] md:text-5xl">
                    Developer Tools
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-[var(--portal-color-text-secondary)]">
                    A collection of handy utilities for everyday development tasks. Running entirely in your browser.
                </p>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={tool.href}
                        className="group relative flex flex-col gap-4 rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--portal-color-primary)] hover:shadow-lg hover:shadow-[var(--portal-color-primary)]/5"
                    >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tool.bg} ${tool.color} transition-transform group-hover:scale-110`}>
                            {tool.icon}
                        </div>
                        <div className="space-y-1.5 mt-2">
                            <h3 className="text-lg font-semibold leading-none tracking-tight text-[var(--portal-color-text)]">
                                {tool.name}
                            </h3>
                            <p className="line-clamp-2 text-sm text-[var(--portal-color-text-secondary)]">
                                {tool.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
