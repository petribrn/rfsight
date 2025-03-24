import { Box, Grid } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes';
import { Header } from './shared/components';
import { AppThemeProvider } from './shared/providers/AppThemeProvider';
import { store } from './shared/store/store';

function App() {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <BrowserRouter>
          <Box
            display="flex"
            flexDirection="column"
            height="100%"
            overflow="auto"
          >
            <Header />
            <Grid
              container
              spacing={0}
              height="100%"
              sx={{ overflowX: 'hidden', overflowY: 'hidden' }}
            >
              <AppRoutes />
            </Grid>
          </Box>
          <ToastContainer />
        </BrowserRouter>
      </AppThemeProvider>
    </Provider>
  );
}

export default App;
