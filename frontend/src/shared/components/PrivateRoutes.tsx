import { jwtDecode } from 'jwt-decode';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppSelector } from '../hooks';
import { selectCurrentToken } from '../store/slices/auth/authSlice';
import { IToken, PrivateRoutesProps } from '../ts/interfaces';

export const PrivateRoutes = ({ allowedPermissions }: PrivateRoutesProps) => {
  const currentToken = useAppSelector(selectCurrentToken);

  if (currentToken) {
    const decodedToken: IToken = jwtDecode(currentToken);
    if (allowedPermissions.includes(decodedToken.permission)) {
      return <Outlet />;
    }
    return (
      toast.error('Permissão insuficiente.') && <Navigate to="/dashboard" />
    );
  }
  return <Navigate to="/auth" />;
};
