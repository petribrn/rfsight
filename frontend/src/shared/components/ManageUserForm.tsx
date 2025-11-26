import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import Joi from 'joi';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';
import { useGetAllOrganizationsQuery } from '../store/slices/organization/organizationApiSlice';
import { useUpdateUserMutation } from '../store/slices/user/userApiSlice';
import { DefaultApiError } from '../ts/interfaces';
import { UserInfo } from '../ts/types';
import {
  EmailSchema,
  FirstNameSchema,
  LastNameSchema,
  PermissionSchema,
  UsernameSchema,
  UserUpdateSchema
} from '../ts/validation';
import { PasswordResetDialog } from './PasswordResetDialog';


interface IProps {
  user: UserInfo
}

export const ManageUserForm = ({ user }: IProps) => {
  const theme = useTheme();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const { data: organizationCollection, isLoading: orgsLoading } =
        useGetAllOrganizationsQuery();

  // States
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const password = 'placeholderPassword';
  const [organizationId, setOrganizationId] = useState(user.organizationId);
  const [permission, setPermission] = useState(String(user.permission));
  const [passowrdResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [userInfoChanged, setUserInfoChanged] = useState(false);

  // Error states
  const [usernameErr, setUsernameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [firstNameErr, setFirstNameErr] = useState('');
  const [lastNameErr, setLastNameErr] = useState('');
  const [permissionErr, setPermissionErr] = useState('');
  const [submitErrMsg, setSubmitErrMsg] = useState('');

  // Handlers
  const handleFieldChange = (
    v: string,
    fieldSchema: Joi.Schema,
    setFieldValue: Dispatch<SetStateAction<any>>,
    setFieldErr: Dispatch<SetStateAction<string>>
  ) => {
    setFieldValue(v);
    setUserInfoChanged(true);
    if (submitErrMsg) setSubmitErrMsg('');

    const { error } = fieldSchema.validate(v);

    if (error) {
      setFieldErr(error.message);
    } else {
      setFieldErr('');
    }
    return v;
  };

  const handleSelectOrg = (event: SelectChangeEvent) => {
    setOrganizationId(event.target.value as string);
    setUserInfoChanged(true);
  };

  const handleOpenPasswordResetDialog = () => {
    setPasswordResetDialogOpen(true);
  }

  const handleClosePasswordResetDialog = () => {
    setPasswordResetDialogOpen(false);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      username,
      email,
      firstName,
      lastName,
      permission: Number(permission),
      organizationId,
    };

    const { error } = UserUpdateSchema.validate(payload);

    if (error) {
      return setSubmitErrMsg(error.message);
    }

    try {
      const updated = await updateUser({ id: user.id, updateUserData: {...payload} }).unwrap();
      toast.success(updated.message);
    } catch (err) {
      const apiErr = err as DefaultApiError;
      setSubmitErrMsg(apiErr.detail.message);
    }
  };

  return (
    <>
      <Box component="form" autoComplete="off" width="100%" onSubmit={handleSubmit}>
        <Typography variant="h6" marginBottom="2rem">
          Atualizar usuário
        </Typography>

        {/* Username */}
        <Box display="flex" flexDirection="column">
          <TextField
            label="Nome de usuário"
            fullWidth
            value={username}
            error={!!usernameErr}
            onChange={(e) =>
              handleFieldChange(e.target.value, UsernameSchema, setUsername, setUsernameErr)
            }
            required
          />
          <Typography variant="caption" color={theme.palette.error.main}>
            {usernameErr}
          </Typography>
        </Box>

        {/* Email */}
        <Box display="flex" flexDirection="column">
          <TextField
            label="Endereço de e-mail"
            sx={{ marginTop: '1rem' }}
            fullWidth
            value={email}
            error={!!emailErr}
            onChange={(e) =>
              handleFieldChange(e.target.value, EmailSchema, setEmail, setEmailErr)
            }
            required
          />
          <Typography variant="caption" color={theme.palette.error.main}>
            {emailErr}
          </Typography>
        </Box>

        <Box display={'flex'} flexDirection={'row'} marginTop={'1rem'} gap={1}>
          <TextField
            id="password"
            label="Senha"
            variant="outlined"
            type="password"
            value={password}
            disabled
          />
          <Tooltip title="Alterar senha">
            <Button variant='outlined' onClick={handleOpenPasswordResetDialog}>
              <EditIcon fontSize='small'/>
            </Button>
          </Tooltip>
        </Box>

        {/* First Name */}
        <Box display="flex" flexDirection="column">
          <TextField
            label="Primeiro nome"
            sx={{ marginTop: '1rem' }}
            fullWidth
            value={firstName}
            error={!!firstNameErr}
            onChange={(e) =>
              handleFieldChange(e.target.value, FirstNameSchema, setFirstName, setFirstNameErr)
            }
            required
          />
          <Typography variant="caption" color={theme.palette.error.main}>
            {firstNameErr}
          </Typography>
        </Box>

        {/* Last Name */}
        <Box display="flex" flexDirection="column">
          <TextField
            label="Último nome"
            sx={{ marginTop: '1rem' }}
            fullWidth
            value={lastName}
            error={!!lastNameErr}
            onChange={(e) =>
              handleFieldChange(e.target.value, LastNameSchema, setLastName, setLastNameErr)
            }
            required
          />
          <Typography variant="caption" color={theme.palette.error.main}>
            {lastNameErr}
          </Typography>
        </Box>

        {/* Organization */}
        {organizationCollection && <FormControl sx={{marginTop: '1rem'}} required fullWidth>
          <InputLabel id="org-select-label">Organização</InputLabel>
          <Select
            labelId="org-select-label"
            id="org-select"
            value={organizationId}
            label="Organização"
            onChange={handleSelectOrg}
            sx={{textAlign: 'left'}}
          >
            {organizationCollection.organizations && organizationCollection.organizations.map((org) =>
              (<MenuItem value={org.id}>{org.name}</MenuItem>))}
          </Select>
        </FormControl>}

        {/* Permission */}
        <FormControl fullWidth sx={{ marginTop: '1rem' }} error={!!permissionErr}>
          <InputLabel id="permission-label">Permissão</InputLabel>
          <Select
            labelId="permission-label"
            label="Permissão"
            value={permission}
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                PermissionSchema,
                setPermission,
                setPermissionErr
              )
            }
          >
            {[1, 2, 3, 4, 5].map((p) => (
              <MenuItem key={p} value={String(p)}>
                {p}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{permissionErr}</FormHelperText>
        </FormControl>

        <Button
          variant="contained"
          size="large"
          type="submit"
          sx={{ marginTop: '2rem' }}
          disabled={
            !userInfoChanged ||
            isLoading ||
            Boolean(orgsLoading) ||
            Boolean(usernameErr) ||
            Boolean(emailErr) ||
            Boolean(firstNameErr)
            || Boolean(lastNameErr)
            || Boolean(permissionErr)
          }
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
      <PasswordResetDialog open={passowrdResetDialogOpen} onClose={handleClosePasswordResetDialog} userId={user.id}/>
      <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};
