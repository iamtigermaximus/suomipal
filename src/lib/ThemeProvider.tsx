'use client';

import React from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import StyledComponentsRegistry from './registry';
import { theme } from './theme';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyledComponentsRegistry>
      <SCThemeProvider theme={theme}>{children}</SCThemeProvider>
    </StyledComponentsRegistry>
  );
}
