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
import { useResetPasswordMutation } from '../store/slices/auth/authApiSlice';
import { DefaultApiError, IResetPasswordForm } from '../ts/interfaces';
import { RPasswordSchema, ResetPasswordSchema } from '../ts/validation';
import { FormPaper } from './styled/FormPaper';

export const ResetPasswordForm = ({ token }: IResetPasswordForm) => {
  // Hooks
  const theme = useTheme();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  // States
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
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
    const resetPasswordPayload = {
      password,
      passwordConfirmation,
    };

    const { error: validationError, value } =
      ResetPasswordSchema.validate(resetPasswordPayload);

    if (validationError) {
      setSubmitErrMsg(validationError.message);
    }

    try {
      const resettedPassword = await resetPassword({
        ...resetPasswordPayload,
        token: token!,
      }).unwrap();
      if (resettedPassword) toast.success(resettedPassword.message);
      navigate('/auth');
      return value;
    } catch (error) {
      const err = error as DefaultApiError;
      setSubmitErrMsg(err.detail.message);
      setTimeout(() => {
        toast.error('Falha ao redefinir senha. Tente novamente.');
        navigate('/auth');
      }, 2000);
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
          Redefinição de senha
        </Typography>
        <Box display="flex" flexDirection="column">
          <TextField
            id="password"
            label="Nova senha"
            variant="outlined"
            sx={{ marginTop: '1rem' }}
            fullWidth
            type="password"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                RPasswordSchema,
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
            label="Confirme a nova senha"
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
          Salvar
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
