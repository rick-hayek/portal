'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps<T extends string | number = string> {
  value?: T;
  onChange?: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  renderTrigger?: (selectedOption?: DropdownOption<T>, isOpen?: boolean) => React.ReactNode;
}

export function Dropdown<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  menuClassName = '',
  align = 'left',
  size = 'md',
  disabled = false,
  renderTrigger,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (option: DropdownOption<T>) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
  };

  // Size styling maps
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 min-h-[32px]',
    md: 'px-3 py-1.5 text-xs font-medium gap-2 min-h-[38px]',
    lg: 'px-4 py-2 text-sm gap-2 min-h-[44px]',
  }[size];

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left">
      {renderTrigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)} className="cursor-pointer">
          {renderTrigger(selectedOption, isOpen)}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-xl border border-[var(--portal-color-border,#e5e7eb)] bg-[var(--portal-color-surface,#ffffff)] text-[var(--portal-color-text,#111827)] shadow-xs transition-all hover:border-[var(--portal-color-primary,#3b82f6)] focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary,#3b82f6)]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${sizeClasses} ${className}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon && (
              <span className="shrink-0 flex items-center justify-center">{selectedOption.icon}</span>
            )}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[var(--portal-color-text-tertiary,#9ca3af)] shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[var(--portal-color-primary,#3b82f6)]' : ''
            }`}
          />
        </button>
      )}

      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 min-w-[160px] w-full rounded-xl border border-[var(--portal-color-border,#e5e7eb)] bg-[var(--portal-color-surface,#ffffff)]/95 backdrop-blur-md py-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
          role="listbox"
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--portal-color-surface-alt,#f3f4f6)] font-semibold text-[var(--portal-color-primary,#3b82f6)]'
                      : option.disabled
                      ? 'opacity-40 cursor-not-allowed text-[var(--portal-color-text-tertiary)]'
                      : 'text-[var(--portal-color-text,#111827)] hover:bg-[var(--portal-color-surface-alt,#f3f4f6)]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-2 truncate">
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[var(--portal-color-primary,#3b82f6)] font-bold" />
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    {option.icon && (
                      <span className="shrink-0 flex items-center justify-center">{option.icon}</span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
