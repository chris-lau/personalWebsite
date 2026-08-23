import { ReactNode } from 'react';
import './Section.css';

interface SectionProps {
  title: string;
  /** Optional mono index chip (e.g. '01') shown before the title. */
  index?: string;
  /** Renders the section as a full-width tinted band (homepage rhythm). */
  tint?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Open content section — the site-wide replacement for boxed BoxContainer
 * panels on pages: numbered head + hairline rule + unboxed content, with an
 * optional full-bleed tinted band for alternating section backgrounds.
 */
export const Section = ({
  title,
  index,
  tint = false,
  id,
  className = '',
  children,
}: SectionProps) => (
  <section id={id} className={`page-section ${tint ? 'page-section--tint' : ''} ${className}`.trim()}>
    <div className="page-section__head">
      {index && <span className="page-section__index" aria-hidden="true">{index}</span>}
      <h2 className="page-section__title">{title}</h2>
      <span className="page-section__rule" aria-hidden="true" />
    </div>
    <div className="page-section__body">{children}</div>
  </section>
);
