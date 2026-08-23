import { ReactNode } from 'react';
import { ModernLayout } from './ModernLayout';

interface LayoutRendererProps {
  children: ReactNode;
}

/** Single-layout site since the Light Crisp consolidation; kept as a seam
 *  so pages never render outside the site chrome. */
export const LayoutRenderer = ({ children }: LayoutRendererProps) => (
  <ModernLayout>{children}</ModernLayout>
);
