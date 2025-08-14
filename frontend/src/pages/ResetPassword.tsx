import { Grid } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PageGridCenteredContainer,
  ResetPasswordForm,
} from '../shared/components';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth');
    } else {
      try {
        const decoded = jwtDecode(token);
        if (decoded && Date.now() >= decoded.exp! * 1000) {
          toast.error('Requisição inválida.');
          navigate('/auth');
        }
      } catch (error) {
        // const err = error as InvalidTokenError;
        toast.error('Requisição inválida.');
        navigate('/auth');
      }
    }
  }, [token, navigate]);

  return (
    <PageGridCenteredContainer>
      <Grid size={{xs:8, md:6, lg:3}}>
        <ResetPasswordForm token={token} />
      </Grid>
    </PageGridCenteredContainer>
  );
};
