import { ComponentType, ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../types/theme';
import { AsciiLayout } from './AsciiLayout';
import { CliLayout } from './CliLayout';
import { ModernLayout } from './ModernLayout';

interface LayoutRendererProps {
  children: ReactNode;
}

const LAYOUT_MAP: Record<ThemeMode, ComponentType<{ children: ReactNode }>> = {
  ascii: AsciiLayout,
  cli: CliLayout,
  modern: ModernLayout,
};

export const LayoutRenderer = ({ children }: LayoutRendererProps) => {
  const { theme } = useTheme();
  const Layout = LAYOUT_MAP[theme] ?? ModernLayout;
  return <Layout>{children}</Layout>;
};
