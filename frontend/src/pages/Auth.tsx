import { Grid, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthForm, PageGridCenteredContainer } from '../shared/components';

export const AuthPage = () => {
  const theme = useTheme();
  return (
    <PageGridCenteredContainer>
      <Grid item xs={8} md={6} lg={3}>
        <Grid container direction="column">
          <Grid item>
            <AuthForm />
          </Grid>
          <Grid item>
            <Typography align="right">
              Não possui uma conta?{' '}
              <Link
                to="/register"
                style={{
                  color: theme.palette.text.primary,
                  textDecorationColor: theme.palette.primary.main,
                }}
              >
                Registre-se
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </PageGridCenteredContainer>
  );
};
