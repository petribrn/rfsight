import { Grid } from '@mui/material';
import { ReactNode } from 'react';
import { SideMenu } from './SideMenu';

interface Props {
  pageContent: ReactNode;
}

export const PageWithSideMenu = ({ pageContent }: Props) => {
  return (
    <Grid container columns={{ xs: 12, sm: 12, md: 12, lg: 14 }} height="100%">
      <Grid
        item
        xs={2}
        sm={2}
        md={2}
        lg={2}
        display={{ xs: 'none', sm: 'none', md: 'grid', lg: 'grid' }}
        height="100vh"
      >
        <SideMenu />
      </Grid>
      <Grid
        item
        xs={12}
        sm={12}
        md={10}
        lg={12}
        p={2.5}
        overflow="auto"
        height="100vh"
      >
        {pageContent}
      </Grid>
    </Grid>
  );
};
