import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AsciiLayout } from './AsciiLayout';
import { CliLayout } from './CliLayout';
import { ModernLayout } from './ModernLayout';

interface LayoutRendererProps {
  children: React.ReactNode;
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({ children }) => {
  const { theme } = useTheme();

  if (theme === 'ascii') {
    return <AsciiLayout>{children}</AsciiLayout>;
  } else if (theme === 'cli') {
    return <CliLayout>{children}</CliLayout>;
  }
  return <ModernLayout>{children}</ModernLayout>;
};
