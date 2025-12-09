/* eslint-disable import/prefer-default-export */
import { createTheme } from '@mui/material';
import { ptBR } from '@mui/material/locale';

/**
 * Define Light theme pallete
 */

declare module '@mui/material/styles' {
  interface Palette {
    graphs: {
      main: string;
      dark: string;
      light: string;
      grey: string;
    };
  }
  // allow configuration using `createTheme`
  interface PaletteOptions {
    graphs?: {
      main?: string;
      dark?: string;
      light?: string;
      grey?: string;
    };
  }
}

export const LightTheme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: {
        main: '#4059AD',
        dark: '#2C3E77',
        light: '#6A80C8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#fefefe',
        dark: '#7d7d7d',
        light: '#fafafa',
        contrastText: '#272727',
      },
      background: {
        default: '#f7f6f3',
        paper: '#ffffff',
      },
      graphs: {
        main: '#00B26B',
        dark: '#163134',
        light: '#D4E167',
        grey: '#E1EFE9',
      },
    },
    typography: {
      fontFamily: 'Nunito Sans',
    },
  },
  ptBR
);
