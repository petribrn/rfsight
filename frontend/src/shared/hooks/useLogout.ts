import { toast } from 'react-toastify';
import { useLogoutMutation } from '../store/slices/auth/authApiSlice';
import { logOut } from '../store/slices/auth/authSlice';
import { useAppDispatch } from './reduxHooks';

export const useLogout = () => {
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      const logoutResponse = await logout().unwrap();
      dispatch(logOut());
      return toast.success(logoutResponse.message);
    } catch (error) {
      console.log(error);
      return false;
    }
  };
  return handleLogout;
};
