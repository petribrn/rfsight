import { toast } from 'react-toastify';
import { useRefreshMutation } from '../store/slices/auth/authApiSlice';
import {
  selectCurrentUser,
  setCredentials,
} from '../store/slices/auth/authSlice';
import { DefaultApiError } from '../ts/interfaces';
import { useAppDispatch, useAppSelector } from './reduxHooks';

export const useRefreshToken = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [refresh] = useRefreshMutation();

  const dispatch = useAppDispatch();

  const refreshT = async () => {
    try {
      const responseRefresh = await refresh().unwrap();
      dispatch(
        setCredentials({
          username: currentUser || responseRefresh.username,
          token: responseRefresh.accessToken,
        })
      );
      return responseRefresh;
    } catch (error) {
      const err = error as DefaultApiError;
      toast.error(err.detail.message);
      return false;
    }
  };
  return refreshT;
};
