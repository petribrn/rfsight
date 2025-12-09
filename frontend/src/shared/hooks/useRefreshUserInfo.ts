import { toast } from 'react-toastify';
import { useGetUserOrganizationPostAuthMutation } from '../store/slices/organization/organizationApiSlice';
import { setOrganizationInfo } from '../store/slices/organization/organizationSlice';
import { useGetUserInfoPostAuthMutation } from '../store/slices/user/userApiSlice';
import { setUserInfo } from '../store/slices/user/userSlice';
import { websocketUrl } from '../ts/enums';
import { DefaultApiError } from '../ts/interfaces';
import { useAppDispatch } from './reduxHooks';

export const useRefreshUserInfo = () => {
  const [getUserInfoPostAuth] = useGetUserInfoPostAuthMutation();
  const [getUserOrganizationPostAuth] = useGetUserOrganizationPostAuthMutation();

  const dispatch = useAppDispatch();

  const refreshUInfo = async (username: string) => {
    if (username) {
      try {
        const getUserInfoResponse =
          await getUserInfoPostAuth(username).unwrap();
        const userOrganization = await getUserOrganizationPostAuth(getUserInfoResponse.id).unwrap();
        dispatch(setUserInfo(getUserInfoResponse));
        dispatch(setOrganizationInfo(userOrganization));
        dispatch({type: 'websocket/disconnect'});
        dispatch({
          type: "websocket/connect",
          payload: { url: websocketUrl },
        });
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
