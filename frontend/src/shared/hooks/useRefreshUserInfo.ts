import { toast } from 'react-toastify';
import { useGetUserInfoPostAuthMutation } from '../store/slices/user/userApiSlice';
import { setUserInfo } from '../store/slices/user/userSlice';
import { DefaultApiError } from '../ts/interfaces';
import { useAppDispatch } from './reduxHooks';

export const useRefreshUserInfo = () => {
  const [getUserInfoPostAuth] = useGetUserInfoPostAuthMutation();

  const dispatch = useAppDispatch();

  const refreshUInfo = async (username: string) => {
    if (username) {
      try {
        const getUserInfoResponse =
          await getUserInfoPostAuth(username).unwrap();
        dispatch(setUserInfo(getUserInfoResponse));
        return true;
      } catch (error) {
        const err = error as DefaultApiError;
        toast.error(err.detail.message);
        return false;
      }
    }
    return false;
  };
  return refreshUInfo;
};
