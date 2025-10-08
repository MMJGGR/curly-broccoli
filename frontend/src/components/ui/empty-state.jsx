import React from 'react';
import { Button } from './button';

export const EmptyState = ({
  icon = null,
  title = 'Nothing here yet',
  description = 'There is no data to display.',
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`text-center py-12 px-4 ${className}`}>
    {icon ? <div className="text-5xl mb-3" aria-hidden>{icon}</div> : null}
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    {actionLabel && (
      <Button variant="default" onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);
