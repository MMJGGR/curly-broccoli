import React from 'react';
import { Button } from './button';

/**
 * PageHeader
 * Consistent page header with title, optional description and actions
 */
const PageHeader = ({
  title,
  description = '',
  primaryAction = null, // { label, onClick, href, variant }
  secondaryAction = null, // { label, onClick, href, variant }
  children,
  className = ''
}) => {
  const renderAction = (action, defaultVariant = 'default') => {
    if (!action) return null;
    const { label, onClick, href, variant = defaultVariant, size = 'sm', 'aria-label': ariaLabel } = action;
    if (href) {
      return (
        <Button asChild variant={variant} size={size} aria-label={ariaLabel || label}>
          <a href={href}>{label}</a>
        </Button>
      );
    }
    return (
      <Button onClick={onClick} variant={variant} size={size} aria-label={ariaLabel || label}>
        {label}
      </Button>
    );
  };

  return (
    <div className={`w-full border-b bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {!!description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
            {children}
          </div>
          <div className="flex items-center gap-2">
            {renderAction(secondaryAction, 'outline')}
            {renderAction(primaryAction, 'default')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

