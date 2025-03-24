import { Grid } from '@mui/material';
import { ReactNode } from 'react';

interface IPageGridCenteredContainerProps {
  children: ReactNode;
}

export const PageGridCenteredContainer = ({
  children,
}: IPageGridCenteredContainerProps) => {
  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      height="100%"
      overflow="auto"
      p={2}
    >
      {children}
    </Grid>
  );
};
