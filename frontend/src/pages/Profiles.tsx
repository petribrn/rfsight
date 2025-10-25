/* eslint-disable no-nested-ternary */
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
import {
  BreadcrumbLink,
  ProfileCreationDialog,
  ProfileList,
} from '../shared/components';
import { useAppSelector } from '../shared/hooks';
import { selectUserInfo } from '../shared/store/slices/user/userSlice';

export const ProfilesPage = () => {
  const [openCreationDialog, setOpenCreationDialog] = useState(false);
  const userInfo = useAppSelector(selectUserInfo);

  const handleOpenCreationDialog = () => {
    setOpenCreationDialog(true);
  };

  const handleCloseCreationDialog = () => {
    setOpenCreationDialog(false);
  };

  return (
    <Grid container gap={3} justifyContent="center" flexDirection="column">
      <Grid>
        <Breadcrumbs aria-label="breadcrumb">
          <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
          <Typography color="text.primary">Profiles</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid>
        {userInfo ? (
          <>
            <Paper sx={{ p: 3 }}>
              <ProfileList />
              <Button
                variant="contained"
                sx={{
                  width: { xs: '100%', sm: '40%', md: '35%', lg: '25%' },
                  mt: 2,
                }}
                onClick={handleOpenCreationDialog}
              >
                Criar profile
              </Button>
            </Paper>
            <ProfileCreationDialog
              open={openCreationDialog}
              handleClose={handleCloseCreationDialog}
            />
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
