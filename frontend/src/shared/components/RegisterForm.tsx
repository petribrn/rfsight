import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import Joi from 'joi';
import { Dispatch, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRegisterNewUserMutation } from '../store/slices/user/userApiSlice';
import { DefaultApiError } from '../ts/interfaces';
import {
  EmailSchema,
  FirstNameSchema,
  LastNameSchema,
  PasswordSchema,
  RegisterSchema,
  UsernameSchema,
} from '../ts/validation';
import { FormPaper } from './styled/FormPaper';

export const RegisterForm = () => {
  // Hooks
  const theme = useTheme();
  const navigate = useNavigate();
  const [registerNewUser, { isLoading }] = useRegisterNewUserMutation();

  // States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // Error states
  const [usernameErr, setUsernameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [firstNameErr, setFirstNameErr] = useState('');
  const [lastNameErr, setLastNameErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [passwordConfirmationErr, setPasswordConfirmationErr] = useState('');
  const [submitErrMsg, setSubmitErrMsg] = useState('');

  // Handlers
  const handleFieldChange = (
    v: string,
    fieldSchema: Joi.Schema,
    setFieldValue: Dispatch<SetStateAction<string>>,
    setFieldErr: Dispatch<SetStateAction<string>>
  ) => {
    setFieldValue(v);
    if (submitErrMsg) setSubmitErrMsg('');

    const { error, value } = fieldSchema.validate(v);

    if (error) {
      setFieldErr(error.message);
    } else {
      setFieldErr('');
    }
    return value;
  };

  const handlePasswordConfirmationChange = (v: string) => {
    setPasswordConfirmation(v);
    if (submitErrMsg) setSubmitErrMsg('');

    if (password !== v) {
      setPasswordConfirmationErr(
        'Confirmação da senha e Senha são diferentes.'
      );
    } else {
      setPasswordConfirmationErr('');
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const registerPayload = {
      username,
      email,
      firstName,
      lastName,
      password,
    };

    const { error: validationError, value } = RegisterSchema.validate({
      ...registerPayload,
      passwordConfirmation,
    });

    if (validationError) {
      setSubmitErrMsg(validationError.message);
    }

    try {
      const registeredNewUser = await registerNewUser(registerPayload).unwrap();
      if (registeredNewUser) toast.success(registeredNewUser.message);
      navigate('/auth');
      return value;
    } catch (error) {
      const err = error as DefaultApiError;
      setSubmitErrMsg(err.detail.message);
      return false;
    }
  };

  return (
    <FormPaper>
      <Box
        component="form"
        autoComplete="off"
        width="100%"
        onSubmit={handleSubmit}
      >
        <Typography variant="h5" marginBottom="2rem">
          Criar conta
        </Typography>
        <Box display="flex" flexDirection="column">
          <TextField
            id="username"
            label="Nome de usuário"
            variant="outlined"
            fullWidth
            autoFocus
            autoComplete="new-password"
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                UsernameSchema,
                setUsername,
                setUsernameErr
              )
            }
            value={username}
            error={usernameErr !== ''}
            required
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            width="100%"
            align="left"
          >
            {usernameErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <TextField
            id="email"
            label="Endereço de e-mail"
            variant="outlined"
            sx={{ marginTop: '1rem' }}
            fullWidth
            autoComplete="new-password"
            type="email"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                EmailSchema,
                setEmail,
                setEmailErr
              )
            }
            value={email}
            error={emailErr !== ''}
            required
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            align="left"
          >
            {emailErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <TextField
            id="firstName"
            label="Primeiro nome"
            variant="outlined"
            sx={{ marginTop: '1rem' }}
            fullWidth
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                FirstNameSchema,
                setFirstName,
                setFirstNameErr
              )
            }
            value={firstName}
            error={firstNameErr !== ''}
            required
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            align="left"
          >
            {firstNameErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <TextField
            id="lastName"
            label="Último nome"
            variant="outlined"
            sx={{ marginTop: '1rem' }}
            autoComplete="new-password"
            fullWidth
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                LastNameSchema,
                setLastName,
                setLastNameErr
              )
            }
            value={lastName}
            error={lastNameErr !== ''}
            required
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            align="left"
          >
            {lastNameErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <TextField
            id="password"
            label="Senha"
            variant="outlined"
            sx={{ marginTop: '1rem' }}
            fullWidth
            type="password"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                PasswordSchema,
                setPassword,
                setPasswordErr
              )
            }
            value={password}
            error={passwordErr !== ''}
            required
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            align="left"
          >
            {passwordErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <TextField
            id="passwordConfirmation"
            label="Confirme a senha"
            variant="outlined"
            sx={{ marginTop: '1rem' }}
            fullWidth
            type="password"
            onChange={(e) => handlePasswordConfirmationChange(e.target.value)}
            value={passwordConfirmation}
            error={passwordConfirmationErr !== ''}
            required
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            align="left"
          >
            {passwordConfirmationErr}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{ marginTop: '1rem' }}
        >
          Registrar-se
        </Button>
        <Alert
          severity="error"
          variant="outlined"
          sx={{ marginTop: '1rem', display: submitErrMsg ? 'flex' : 'none' }}
        >
          {submitErrMsg}
        </Alert>
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </FormPaper>
  );
};
