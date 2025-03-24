import {
  Alert,
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useLoginMutation } from '../store/slices/auth/authApiSlice';
import {
  selectCurrentPersistState,
  setCredentials,
  togglePersist,
} from '../store/slices/auth/authSlice';
import { useGetUserInfoPostAuthMutation } from '../store/slices/user/userApiSlice';
import { setUserInfo } from '../store/slices/user/userSlice';
import { DefaultApiError } from '../ts/interfaces';
import { FormPaper } from './styled/FormPaper';

export const AuthForm = () => {
  const [user, setUser] = useState('');
  const [passwd, setPasswd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const persist: boolean = useAppSelector(selectCurrentPersistState);
  const [getUserInfoPostAuth, { isLoading: isLoadingUserInfo }] =
    useGetUserInfoPostAuthMutation();
  const theme = useTheme();

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const handlePersistSession = () => {
    dispatch(togglePersist());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Send login payload and get token
      const loginResponse = await login({
        username: user.toLowerCase(),
        password: passwd,
      }).unwrap();
      dispatch(
        setCredentials({ username: user, token: loginResponse.accessToken })
      );
      // Get user complete info and populate state
      const userInfoResponse = await getUserInfoPostAuth(user).unwrap();
      dispatch(setUserInfo(userInfoResponse));
      setUser('');
      setPasswd('');
      await toast.success('Login efetuado com sucesso.');
      navigate('/dashboard');
    } catch (error) {
      const err = error as DefaultApiError;
      setErrorMsg(err.detail.message);
    }
  };

  return (
    <FormPaper>
      <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
        <Typography variant="h5" marginBottom="2rem">
          Autentique-se
        </Typography>
        <TextField
          id="username"
          label="Usuário/E-mail"
          variant="outlined"
          sx={{ marginBottom: '1rem' }}
          fullWidth
          autoFocus
          type="text"
          onChange={(e) => {
            setUser(e.target.value);
            setErrorMsg('');
          }}
          value={user}
          required
        />
        <TextField
          id="password"
          label="Senha"
          variant="outlined"
          // sx={{ marginBottom: '1rem' }}
          fullWidth
          type="password"
          onChange={(e) => {
            setPasswd(e.target.value);
            setErrorMsg('');
          }}
          value={passwd}
          required
        />
        <Box
          alignContent="flex-start"
          justifyItems="flex-start"
          textAlign="left"
          marginTop="0.5rem"
        >
          <Link
            to="/forgot-password"
            style={{
              color: theme.palette.text.primary,
              textDecorationColor: theme.palette.primary.main,
            }}
          >
            Esqueceu a senha?
          </Link>
        </Box>
        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{ marginTop: '1rem' }}
        >
          Entrar
        </Button>
        <Box display="flex">
          <FormControlLabel
            control={
              <Checkbox checked={persist} onChange={handlePersistSession} />
            }
            label="Manter-se autenticado?"
            sx={{ marginTop: '0.5rem' }}
          />
        </Box>

        <Alert
          severity="error"
          variant="outlined"
          sx={{ marginTop: '1rem', display: errorMsg ? 'flex' : 'none' }}
        >
          {errorMsg}
        </Alert>
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
        open={isLoading || isLoadingUserInfo}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </FormPaper>
  );
};
