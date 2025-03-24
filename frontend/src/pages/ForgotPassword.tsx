import { Grid } from '@mui/material';
import {
  ForgotPasswordForm,
  PageGridCenteredContainer,
} from '../shared/components';

export const ForgotPasswordPage = () => {
  return (
    <PageGridCenteredContainer>
      <Grid item xs={8} md={6} lg={3}>
        <ForgotPasswordForm />
      </Grid>
    </PageGridCenteredContainer>
  );
};
