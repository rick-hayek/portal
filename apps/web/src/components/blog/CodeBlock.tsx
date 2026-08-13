'use client';

import { Check, Copy } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (!preRef.current) return;
    // Extract plain text from code block
    const text = preRef.current.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 z-10 flex items-center justify-center rounded-lg border border-white/10 bg-black/40 p-1.5 text-xs text-gray-300 opacity-70 backdrop-blur-xs transition-all hover:bg-black/70 hover:text-white hover:opacity-100 focus:outline-hidden cursor-pointer"
        title="Copy code"
        aria-label="Copy code to clipboard"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre ref={preRef} {...props} className={className}>
        {children}
      </pre>
    </div>
  );
}
