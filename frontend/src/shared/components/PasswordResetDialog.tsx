import CloseIcon from '@mui/icons-material/Close';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import Joi from 'joi';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';

import {
  useResetPasswordAdminMutation,
  useValidatePasswordMutation
} from '../store/slices/auth/authApiSlice';

import { DefaultApiError } from '../ts/interfaces';
import { PasswordSchema, ResetPasswordSchema } from '../ts/validation';

interface IProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export const PasswordResetDialog = ({ open, onClose, userId }: IProps) => {
  const [step, setStep] = useState(1);

  // Step 1
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordErr, setCurrentPasswordErr] = useState('');

  // Step 2
  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordErr, setConfirmPasswordErr] = useState('');

  const [submitErrMsg, setSubmitErrMsg] = useState('');

  const [validatePassword, { isLoading: loadingValidate }] =
    useValidatePasswordMutation();

  const [resetPasswordAdmin, { isLoading: loadingReset }] =
    useResetPasswordAdminMutation();

  const setDefaultState = () => {
    setStep(1);
    setCurrentPassword('');
    setCurrentPasswordErr('');
    setPassword('');
    setPasswordErr('');
    setConfirmPassword('');
    setConfirmPasswordErr('');
    setSubmitErrMsg('');
  }

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

  const handleValidateStep1 = async () => {
    const { error } = PasswordSchema.validate(currentPassword);

    if (error) {
      setCurrentPasswordErr(error.message);
      return;
    }

    try {
      const res = await validatePassword({
        userId,
        currentPassword
      }).unwrap();

      if (!res.valid) {
        setCurrentPasswordErr('Senha atual incorreta.');
        return false;
      }

      setStep(2);
    } catch (error) {
      const err = error as DefaultApiError;
      setSubmitErrMsg(err.detail.message);
      return false;
    }
  };

  const handleResetStep2 = async () => {
    const { error } = ResetPasswordSchema.validate({
      password,
      passwordConfirmation: confirmPassword
    });

    if (error) {
      const path = error.details[0].path[0];

      if (path === 'password') setPasswordErr(error.message);
      if (path === 'passwordConfirmation') setConfirmPasswordErr(error.message);

      return;
    }

    try {
      const res = await resetPasswordAdmin({
        userId,
        newPassword: password
      }).unwrap();

      toast.success(res.message);
      handleClose();
    } catch (error) {
      const err = error as DefaultApiError;
      setSubmitErrMsg(err.detail.message);
      return false;
    }
  };

  const handleClose = () => {
    onClose();
    setDefaultState();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">Resetar senha</Typography>
          <Tooltip title="Fechar">
            <IconButton onClick={() => {
              setDefaultState();
              handleClose();
            }}>
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>

        {step === 1 && (
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Senha atual"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  PasswordSchema,
                  setCurrentPassword,
                  setCurrentPasswordErr
                )
              }
              error={!!currentPasswordErr}
              helperText={currentPasswordErr}
            />

            <Button variant="contained" onClick={handleValidateStep1}>
              Continuar
            </Button>

            {submitErrMsg && (
              <Typography color="error">{submitErrMsg}</Typography>
            )}
          </Box>
        )}

        {step === 2 && (
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Nova senha"
              type="password"
              fullWidth
              value={password}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  PasswordSchema,
                  setPassword,
                  setPasswordErr
                )
              }
              error={!!passwordErr}
              helperText={passwordErr}
            />

            <TextField
              label="Confirmar nova senha"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  Joi.string().required(),
                  setConfirmPassword,
                  setConfirmPasswordErr
                )
              }
              error={!!confirmPasswordErr}
              helperText={confirmPasswordErr}
            />

            <Button variant="contained" onClick={handleResetStep2}>
              Atualizar senha
            </Button>

            {submitErrMsg && (
              <Typography color="error">{submitErrMsg}</Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <Backdrop
        sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
        open={loadingValidate || loadingReset}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
};
