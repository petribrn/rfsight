import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
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
import { useForgotPasswordMutation } from '../store/slices/auth/authApiSlice';
import { DefaultApiError } from '../ts/interfaces';
import { EmailSchema, ResetEmailSchema } from '../ts/validation';
import { FormPaper } from './styled/FormPaper';

export const ForgotPasswordForm = () => {
  // Hooks
  const theme = useTheme();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();

  // States
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [emailSent, setEmailSent] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const forgotPasswordPayload = {
      email,
    };

    const { error: validationError, value } = ResetEmailSchema.validate(
      forgotPasswordPayload.email
    );

    if (validationError) {
      setSubmitErrMsg(validationError.message);
    }

    try {
      const forgotPasswdEmailSent = await forgotPassword(
        forgotPasswordPayload
      ).unwrap();
      if (forgotPasswdEmailSent) toast.success(forgotPasswdEmailSent.message);
      setEmailSent(true);
      return value;
    } catch (error) {
      const err = error as DefaultApiError;
      setSubmitErrMsg(err.detail.message);
      return false;
    }
  };

  const handleGoBacktoAuth = () => {
    setEmail('');
    setEmailSent(false);
    navigate('/auth');
  };

  return (
    <FormPaper>
      <Box
        component="form"
        autoComplete="off"
        width="100%"
        onSubmit={handleSubmit}
      >
        {emailSent ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            height="15vh"
          >
            <Typography variant="h5">Email enviado</Typography>
            <CheckCircleOutlineIcon fontSize="large" color="primary" />
            <Button
              variant="contained"
              size="large"
              fullWidth
              type="button"
              sx={{ marginTop: '1rem' }}
              onClick={() => handleGoBacktoAuth()}
            >
              Voltar ao Login
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h5" marginBottom="2rem">
              E-mail para recuperação
            </Typography>
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
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="inherit"
                size="large"
                type="button"
                sx={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                startIcon={<KeyboardArrowLeftIcon />}
                onClick={() => handleGoBacktoAuth()}
              >
                Voltar
              </Button>
              <Button
                variant="contained"
                size="large"
                type="submit"
                fullWidth
                sx={{ marginTop: '1rem' }}
              >
                Enviar
              </Button>
            </Box>
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                marginTop: '1rem',
                display: submitErrMsg ? 'flex' : 'none',
              }}
            >
              {submitErrMsg}
            </Alert>
          </>
        )}
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
