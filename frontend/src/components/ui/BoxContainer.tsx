import React from 'react';
import './BoxContainer.css';

export interface BoxContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Flat widget panel for app-like surfaces (chat, monitoring dashboards).
 * Pages should prefer the open Section component; this stays boxed on
 * purpose — it contains things you operate, not things you read.
 */
export const BoxContainer: React.FC<BoxContainerProps> = ({
  title,
  children,
  className = '',
}) => (
  <div className={`box-container ${className}`.trim()}>
    {title && <h3 className="box-section-heading">{title}</h3>}
    <div className="ascii-box-content">{children}</div>
  </div>
);

// Backward compatibility alias export
export const AsciiBox = BoxContainer;
