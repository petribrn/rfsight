import { Grid } from '@mui/material';
import { ReactNode } from 'react';
import { SideMenu } from './SideMenu';

interface Props {
  pageContent: ReactNode;
}

export const PageWithSideMenu = ({ pageContent }: Props) => {
  return (
    <Grid container columns={{ xs: 12, sm: 12, md: 12, lg: 14 }} size={12} height="100%">
      <Grid
        size={{xs: 2, sm: 2, md: 2, lg: 2}}
        display={{ xs: 'none', sm: 'none', md: 'grid', lg: 'grid' }}
        height="100vh"
      >
        <SideMenu />
      </Grid>
      <Grid
        size={{xs: 12, sm: 12, md: 10, lg: 12}}
        overflow="auto"
        height="100vh"
        p={2}
        pb={10}
        sx={{flexGrow: 1}}
      >
        {pageContent}
      </Grid>
    </Grid>
  );
};
