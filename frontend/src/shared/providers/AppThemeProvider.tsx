/* eslint-disable import/prefer-default-export */
import { Box, ThemeProvider } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from '../contexts';
import { DarkTheme, LightTheme } from '../themes';
import { AppThemeProviderProps } from '../ts/interfaces';

/**
 * Defines AppThemeProvider which wraps all the application
 * in order to provide theme instance globally
 */

const useThemeDetector = () => {
  const getCurrentTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());
  const mqListener = (e: {
    matches: boolean | ((prevState: boolean) => boolean);
  }) => {
    setIsDarkTheme(e.matches);
  };

  useEffect(() => {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    darkThemeMq.addEventListener('change', mqListener);
    return () => darkThemeMq.removeEventListener('change', mqListener);
  }, []);
  return isDarkTheme ? 'dark' : 'light';
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const userThemePreference = useThemeDetector();
  const [themeName, setThemeName] = useState<'light' | 'dark'>(
    userThemePreference
  );

  // Define callback method to toggle theme
  const toggleTheme = useCallback(() => {
    setThemeName((oldThemeName) =>
      oldThemeName === 'light' ? 'dark' : 'light'
    );
  }, []);

  const theme = useMemo(() => {
    if (themeName === 'light') return LightTheme;

    return DarkTheme;
  }, [themeName]);

  const themeMemo = useMemo(
    () => ({
      themeName,
      toggleTheme,
    }),
    [themeName, toggleTheme]
  );

  useEffect(() => {
    setThemeName(userThemePreference);
  }, [userThemePreference]);

  // Return app wrapper component with theme memos
  return (
    <ThemeContext.Provider value={themeMemo}>
      <ThemeProvider theme={theme}>
        <Box
          width="100vw"
          height="100vh"
          bgcolor={theme.palette.background.default}
        >
          {children}
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
