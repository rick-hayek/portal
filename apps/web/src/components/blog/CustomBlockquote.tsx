import { AlertCircle, AlertTriangle, Ban, Info, Lightbulb } from 'lucide-react';
import React from 'react';

const ALERT_TYPES = {
  NOTE: {
    label: 'Note',
    icon: Info,
    colorClass:
      'border-blue-500 bg-blue-50/50 text-blue-900 dark:bg-blue-950/20 dark:text-blue-200',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  TIP: {
    label: 'Tip',
    icon: Lightbulb,
    colorClass:
      'border-green-500 bg-green-50/50 text-green-900 dark:bg-green-950/20 dark:text-green-200',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  IMPORTANT: {
    label: 'Important',
    icon: AlertCircle,
    colorClass:
      'border-purple-500 bg-purple-50/50 text-purple-900 dark:bg-purple-950/20 dark:text-purple-200',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
  WARNING: {
    label: 'Warning',
    icon: AlertTriangle,
    colorClass:
      'border-yellow-500 bg-yellow-50/50 text-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-200',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
  },
  CAUTION: {
    label: 'Caution',
    icon: Ban,
    colorClass: 'border-red-500 bg-red-50/50 text-red-900 dark:bg-red-950/20 dark:text-red-200',
    iconColor: 'text-red-500 dark:text-red-400',
  },
};

export function CustomBlockquote({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) {
  // Regex to match GFM Alert prefix: [!NOTE], [!TIP], etc., allowing leading whitespace
  const alertRegex = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:\r?\n)?/i;

  const childrenArray = React.Children.toArray(children);

  // Scan children to see if any of them contain the GFM alert marker
  let alertMatch: {
    type: keyof typeof ALERT_TYPES;
    matchIndex: number;
    textIndex?: number;
    element?: React.ReactElement<{ children?: React.ReactNode }>;
  } | null = null;

  for (let i = 0; i < childrenArray.length; i++) {
    const child = childrenArray[i];

    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<{ children?: React.ReactNode }>;
      const elementChildren = React.Children.toArray(element.props.children);

      for (let j = 0; j < elementChildren.length; j++) {
        const item = elementChildren[j];
        if (typeof item === 'string') {
          const match = item.match(alertRegex);
          if (match) {
            alertMatch = {
              type: match[1].toUpperCase() as keyof typeof ALERT_TYPES,
              matchIndex: i,
              textIndex: j,
              element: element,
            };
            break;
          }
        }
      }
    } else if (typeof child === 'string') {
      const match = child.match(alertRegex);
      if (match) {
        alertMatch = {
          type: match[1].toUpperCase() as keyof typeof ALERT_TYPES,
          matchIndex: i,
        };
        break;
      }
    }

    if (alertMatch) break;
  }

  // If a GFM alert indicator was found, render as a styled callout box
  if (alertMatch) {
    const alertConfig = ALERT_TYPES[alertMatch.type];
    const Icon = alertConfig.icon;

    let content: React.ReactNode = null;

    if (alertMatch.element && alertMatch.textIndex !== undefined) {
      // Clean the text node inside the paragraph element
      const element = alertMatch.element;
      const elementChildren = React.Children.toArray(element.props.children);
      const textNode = elementChildren[alertMatch.textIndex] as string;
      const cleanedText = textNode.replace(alertRegex, '');

      let updatedElement: React.ReactNode = null;
      if (cleanedText.trim() || elementChildren.length > 1) {
        const updatedChildren = [...elementChildren];
        updatedChildren[alertMatch.textIndex] = cleanedText;
        updatedElement = React.cloneElement(element, {}, ...updatedChildren);
      }

      const before = childrenArray.slice(0, alertMatch.matchIndex);
      const after = childrenArray.slice(alertMatch.matchIndex + 1);
      content = (
        <>
          {before}
          {updatedElement}
          {after}
        </>
      );
    } else {
      // Clean the raw string child
      const textNode = childrenArray[alertMatch.matchIndex] as string;
      const cleanedText = textNode.replace(alertRegex, '');

      const before = childrenArray.slice(0, alertMatch.matchIndex);
      const after = childrenArray.slice(alertMatch.matchIndex + 1);
      content = (
        <>
          {before}
          {cleanedText.trim() && <p>{cleanedText}</p>}
          {after}
        </>
      );
    }

    return (
      <div className={`my-6 border-l-4 p-4 rounded-r-lg ${alertConfig.colorClass}`}>
        <div className="flex items-center gap-2 font-bold mb-2 text-sm uppercase tracking-wide select-none">
          <Icon className={`h-4 w-4 ${alertConfig.iconColor}`} />
          <span>{alertConfig.label}</span>
        </div>
        <div className="text-sm space-y-2">{content}</div>
      </div>
    );
  }

  // Render a standard blockquote if no alert prefix is found
  return (
    <blockquote
      className="border-l-4 border-[var(--portal-color-border)] pl-4 italic my-6 text-[var(--portal-color-text-secondary)]"
      {...props}
    >
      {children}
    </blockquote>
  );
}
