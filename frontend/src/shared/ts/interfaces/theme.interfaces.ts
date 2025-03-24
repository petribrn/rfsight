import { ReactNode } from 'react';
import { ThemeName } from '../types';

export interface IThemeContextData {
  themeName: ThemeName;
  toggleTheme: () => void;
}

export interface AppThemeProviderProps {
  children: ReactNode;
}
