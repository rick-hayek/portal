'use client';

import { Check, ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface ToolDropdownOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface ToolDropdownProps<T extends string> {
  value: T;
  options: ToolDropdownOption<T>[];
  onChange: (value: T) => void;
  headerTitle?: string;
}

export function ToolDropdown<T extends string>({
  value,
  options,
  onChange,
  headerTitle = 'Select Mode',
}: ToolDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = options.find((o) => o.id === value) || options[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]/90 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-[var(--portal-color-text)] shadow-xs hover:border-[var(--portal-color-primary)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        title="Switch Mode"
      >
        <span className="flex items-center gap-1.5">
          {currentOption.icon}
          <span className="hidden sm:inline">{currentOption.label}</span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[var(--portal-color-text-secondary)] transition-transform duration-200 ${open ? 'rotate-180' : ''
            }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 z-30">
          {headerTitle && (
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--portal-color-text-tertiary)] border-b border-[var(--portal-color-border-soft)] mb-1">
              {headerTitle}
            </div>
          )}
          {options.map((option) => {
            const isSelected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${isSelected
                  ? 'bg-[var(--portal-color-primary-soft,#f0f9ff)] text-[var(--portal-color-primary)] font-semibold'
                  : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] hover:text-[var(--portal-color-text)]'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-[var(--portal-color-primary)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface ToolHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  actions?: React.ReactNode;
}

export function ToolHeader({
  title,
  description,
  icon,
  iconBgColor = 'bg-[rgba(107,142,201,0.1)] text-[var(--portal-color-primary)]',
  actions,
}: ToolHeaderProps) {
  return (
    <header className="relative space-y-4 pt-4 sm:pt-8">
      <div className="flex items-start justify-between gap-4 pr-16 sm:pr-44">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBgColor}`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[var(--portal-color-text)] truncate sm:whitespace-normal">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--portal-color-text-secondary)]">
              {description}
            </p>
          </div>
        </div>
      </div>

      {actions && (
        <div className="absolute right-0 top-2 sm:top-6 z-20 flex items-center">
          {actions}
        </div>
      )}
    </header>
  );
}
