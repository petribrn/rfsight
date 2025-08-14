/* eslint-disable no-nested-ternary */
import { Backdrop, CircularProgress, Grid } from '@mui/material';
import { DashboardGraphs, OrganizationTabs } from '../shared/components';
import { useAppSelector } from '../shared/hooks';
import { selectUserInfo } from '../shared/store/slices/user/userSlice';

export const DashboardPage = () => {
  const userInfo = useAppSelector(selectUserInfo);

  return (
    <Grid container gap={3} justifyContent="center" flexDirection="column">
      <Grid>
        {userInfo ? (
          userInfo?.organizationId ? (
            <DashboardGraphs organizationId={userInfo.organizationId} />
          ) : (
            <OrganizationTabs currentUserInfo={userInfo!} />
          )
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
