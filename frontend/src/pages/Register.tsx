import { Grid, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { PageGridCenteredContainer, RegisterForm } from '../shared/components';

export const RegisterPage = () => {
  const theme = useTheme();
  return (
    <PageGridCenteredContainer>
      <Grid size={{xs:8, md:6, lg:3}}>
        <Grid container direction="column">
          <Grid>
            <RegisterForm />
          </Grid>
          <Grid>
            <Typography align="right">
              Já possui uma conta?{' '}
              <Link
                to="/auth"
                style={{
                  color: theme.palette.text.primary,
                  textDecorationColor: theme.palette.primary.main,
                }}
              >
                Autentique-se
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </PageGridCenteredContainer>
  );
};
