import React from 'react';
import './BoxContainer.css';

export interface BoxContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'single' | 'double';
}

export const BoxContainer: React.FC<BoxContainerProps> = ({
  title,
  children,
  className = '',
  variant = 'single',
}) => {
  const borderChar = variant === 'double' ? '=' : '-';
  const cornerChar = '+';

  return (
    <div className={`box-container box-container-${variant} ${className}`}>
      <div className="ascii-box-header-row" aria-hidden="true">
        <span className="corner">{cornerChar}</span>
        {title ? (
          <>
            <span className="border-line">{borderChar}{borderChar}</span>
            <span className="box-title">[ {title} ]</span>
            <span className="border-line flex-fill">{borderChar}</span>
          </>
        ) : (
          <span className="border-line flex-fill">{borderChar}</span>
        )}
        <span className="corner">{cornerChar}</span>
      </div>

      {title && <h3 className="box-section-heading">{title}</h3>}

      <div className="ascii-box-content">{children}</div>

      <div className="ascii-box-footer-row" aria-hidden="true">
        <span className="corner">{cornerChar}</span>
        <span className="border-line flex-fill">{borderChar}</span>
        <span className="corner">{cornerChar}</span>
      </div>
    </div>
  );
};

// Backward compatibility alias export
export const AsciiBox = BoxContainer;
export type AsciiBoxProps = BoxContainerProps;

