/* eslint-disable import/prefer-default-export */
import { createContext, useContext } from 'react';
import { IThemeContextData } from '../ts/interfaces';

/**
 * Create and export app theme context, in order to wrapper
 * deliver a single value application wide
 */

export const ThemeContext = createContext({} as IThemeContextData);

// Export react hook to access context values
export const useAppThemeContext = () => {
  return useContext(ThemeContext);
};
