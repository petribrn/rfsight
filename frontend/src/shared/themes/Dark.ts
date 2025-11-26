/* eslint-disable import/prefer-default-export */
import { createTheme } from '@mui/material';
import { ptBR } from '@mui/material/locale';

/**
 * Define Dark theme pallete
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

export const DarkTheme = createTheme(
  {
    palette: {
      mode: 'dark',
      primary: {
        main: '#4059AD',
        dark: '#2C3E77',
        light: '#6A80C8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#30363D',
        dark: '#030304',
        light: '#5D6976',
        contrastText: '#ffffff',
      },
      background: {
        default: '#010409',
        paper: '#0D1117',
      },
      graphs: {
        main: '#00B26B',
        dark: '#163134',
        light: '#D4E167',
        grey: '#E1EFE9',
      },
    },
    typography: {
      allVariants: {
        color: 'white',
        fontFamily: 'Nunito Sans',
      },
    },
  },
  ptBR
);
