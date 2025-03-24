import {
  Backdrop,
  Breadcrumbs,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { DeviceAdoptionDialog, DeviceList } from '../shared/components';
import { BreadcrumbLink } from '../shared/components/BreadcrumbLink';
import { useAppSelector } from '../shared/hooks';
import { selectUserInfo } from '../shared/store/slices/user/userSlice';

export const DevicesPage = () => {
  const [openAdoptionDialog, setOpenAdoptionDialog] = useState(false);
  const userInfo = useAppSelector(selectUserInfo);

  const handleOpenAdoptionDialog = () => {
    setOpenAdoptionDialog(true);
  };

  const handleCloseAdoptionDialog = () => {
    setOpenAdoptionDialog(false);
  };

  return (
    <Grid container gap={3} justifyContent="center" flexDirection="column">
      <Grid item>
        <Breadcrumbs aria-label="breadcrumb">
          <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
          <Typography color="text.primary">Dispositivos</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item>
        {userInfo ? (
          <>
            <Paper sx={{ p: 3 }}>
              <DeviceList organizationId={userInfo.organizationId} />
              <Button
                variant="contained"
                sx={{
                  width: { xs: '100%', sm: '40%', md: '35%', lg: '25%' },
                  mt: 2,
                }}
                onClick={handleOpenAdoptionDialog}
              >
                Adotar dispositivo
              </Button>
            </Paper>
            <DeviceAdoptionDialog
              open={openAdoptionDialog}
              handleClose={handleCloseAdoptionDialog}
              organizationId={userInfo.organizationId}
            />{' '}
          </>
        ) : (
          <Backdrop
            sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
            open
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
      </Grid>
    </Grid>
  );
};
