/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import { Backdrop, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  useAppSelector,
  useLogout,
  useRefreshToken,
  useRefreshUserInfo,
} from '../hooks';
import {
  selectCurrentPersistState,
  selectCurrentToken,
} from '../store/slices/auth/authSlice';

export const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const currentToken = useAppSelector(selectCurrentToken);
  const refresh = useRefreshToken();
  const persist = useAppSelector(selectCurrentPersistState);
  const refreshUserInfo = useRefreshUserInfo();
  const logout = useLogout();

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshTokenAndUserInfo = async () => {
      try {
        const refreshTokenData = await refresh();
        if (refreshTokenData) {
          await refreshUserInfo(refreshTokenData.username);
        }
      } catch (error) {
        console.log(error);
        await logout(); // Make sure that state is back to null and cookie is removed
        navigate('/auth');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    !currentToken && persist
      ? verifyRefreshTokenAndUserInfo()
      : setIsLoading(false);
    isMounted = false;
  }, [currentToken]);

  if (!persist) {
    return <Outlet />;
  }
  if (isLoading) {
    return (
      <Backdrop
        sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }
  return <Outlet />;
};
