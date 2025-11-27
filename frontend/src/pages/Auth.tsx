import { Grid, useTheme } from '@mui/material';
import { AuthForm, PageGridCenteredContainer } from '../shared/components';

export const AuthPage = () => {
  const theme = useTheme();
  return (
    <PageGridCenteredContainer>
      <Grid size={{xs:8, md:6, lg:3}} >
        <Grid container direction="column">
          <Grid>
            <AuthForm />
          </Grid>
          {/* <Grid>
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
          </Grid> */}
        </Grid>
      </Grid>
    </PageGridCenteredContainer>
  );
};
