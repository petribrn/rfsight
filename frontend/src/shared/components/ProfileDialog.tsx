/* eslint-disable react/no-unescaped-entities */
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import {
  Alert,
  alpha,
  Backdrop,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Joi from 'joi';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateNewProfileMutation,
  useEditProfileByIdMutation,
} from '../store/slices/profile/profileApiSlice';
import {
  DefaultApiError,
  INewProfilePayload,
  IProfileDialogProps,
  IProfileUpdatePayload,
} from '../ts/interfaces';
import { ProfileActions, StationTable } from '../ts/types';
import {
  ApiBaseUrlSchema,
  FieldMapKeySchema,
  FieldMapValueSchema,
  IndexFromSchema,
  ProfileNameSchema,
  ProfileSchema,
  ProfileUpdateSchema,
  RootOIDSchema,
} from '../ts/validation';
import { ProfileActionsList } from './ProfileActionsList';

export const ProfileDialog = ({
  open,
  handleClose,
  operation,
  originalProfileData,
}: IProfileDialogProps) => {

  const defaultStationTable = {
    root_oid: "",
    field_map: {},
    index_from: "",
  }

  const defaultApiBaseUrl = "http://{{DEVICE_IP_ADDRESS}}"

  // Hooks
  const theme = useTheme();
  const [createNewProfile, { isLoading }] = useCreateNewProfileMutation();
  const [editProfile, { isLoading: isLoadingUpdate }] =
    useEditProfileByIdMutation();

  // States
  const [name, setName] = useState(
    originalProfileData ? originalProfileData.name : ''
  );
  const [apiBaseUrl, setApiBaseUrl] = useState(originalProfileData ? originalProfileData.apiBaseUrl : defaultApiBaseUrl)
  const [stationTable, setStationTable] = useState<StationTable>(originalProfileData ? originalProfileData.stationTable : defaultStationTable);
  const [actions, setActions] = useState<ProfileActions>(
    originalProfileData ? originalProfileData.actions : {}
  );
  const [fieldMapKey, setFieldMapKey] = useState("");
  const [fieldMapValue, setFieldMapValue] = useState("");

  // Error states
  const [nameErr, setNameErr] = useState('');
  const [apiBaseUrlErr, setApiBaseUrlErr] = useState('');
  const [submitErrMsg, setSubmitErrMsg] = useState('');
  const [rootOidErr, setRootOidErr] = useState('');
  const [indexFromErr, setIndexFromErr] = useState('');
  const [fieldMapKeyErr, setFieldMapKeyErr] = useState("");
  const [fieldMapValueErr, setFieldMapValueErr] = useState("");

  useEffect(() => {
    if (originalProfileData) {
      setName(originalProfileData.name);
      setApiBaseUrl(originalProfileData.apiBaseUrl ?? defaultApiBaseUrl);
      setStationTable(originalProfileData.stationTable ?? defaultStationTable);
      setActions(originalProfileData.actions);
    }
  }, [originalProfileData, open]);

  const setStationField = (field: keyof StationTable, value: any, fieldSchema: Joi.Schema | null = null, setFieldErr: Dispatch<SetStateAction<string>> | null = null) => {
    setStationTable((prev: any) => ({ ...prev, [field]: value }));
    if (fieldSchema && setFieldErr){
      const { error, value: validatedValue } = fieldSchema.validate(value);

      if (error) {
        setFieldErr(error.message);
      } else {
        setFieldErr('');
      }
      return validatedValue
    }
  };

  const setDefaultState = () => {
    setName('');
    setNameErr('');
    setApiBaseUrlErr('');
    setRootOidErr('')
    setIndexFromErr('');
    setFieldMapKeyErr('');
    setFieldMapValueErr('');
    setSubmitErrMsg('');
    setStationTable(defaultStationTable);
    setApiBaseUrl(defaultApiBaseUrl);
    setActions({});
  }

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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement | HTMLDivElement>
  ) => {
    e.preventDefault();

    if (operation === 'create') {
      const profilePayload: INewProfilePayload = {
        name,
        apiBaseUrl,
        stationTable: {...stationTable, index_from: stationTable.index_from === '' ? null : stationTable.index_from },
        actions,
      };

      const { error: validationError, value } = ProfileSchema.validate({
        ...profilePayload,
      });

      if (validationError) {
        setSubmitErrMsg(validationError.message);
        return false;
      }

      try {
        const createdNewProfile =
          await createNewProfile(profilePayload).unwrap();
        if (createdNewProfile) toast.success(createdNewProfile.message);
        setDefaultState();
        handleClose();
        return value;
      } catch (error) {
        const err = error as DefaultApiError;
        setSubmitErrMsg(err.detail.message);
        return false;
      }
    } else if (operation === 'edit') {
      const profilePayload: IProfileUpdatePayload = {
        id: originalProfileData!.id,
        newProfileData: {
          name,
          apiBaseUrl,
          stationTable: {...stationTable, index_from: stationTable.index_from === '' ? null : stationTable.index_from },
          actions,
        },
      };

      const { error: validationError, value } = ProfileUpdateSchema.validate({
        ...profilePayload.newProfileData,
      });

      if (validationError) {
        setSubmitErrMsg(validationError.message);
        return false;
      }

      try {
        const editedProfile = await editProfile(profilePayload).unwrap();
        if (editedProfile) toast.success(editedProfile.message);
        setDefaultState();
        handleClose();
        return value;
      } catch (error) {
        const err = error as DefaultApiError;
        setSubmitErrMsg(err.detail.message);
        return false;
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setDefaultState();
        handleClose();
      }}
      onSubmit={handleSubmit}
      slotProps={{
        paper: {
          component: 'form',
          sx: {
            p: 2,
            width: { xs: '80vw', sm: '80vw', md: '70vw', lg: '60vw' },
            maxHeight: '85vh'
          },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">
            {operation === 'create' ? 'Criar' : 'Editar'} Profile
          </Typography>
          <Tooltip title="Fechar">
            <IconButton
              onClick={() => {
                setDefaultState();
                handleClose();
              }}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ overflow: 'auto' }}>
        <DialogContentText>
          {operation === 'create'
            ? 'Preencha os dados do novo profile'
            : 'Altere os dados do profile'}{' '}
          e clique em "Salvar".
        </DialogContentText>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="name"
            label="Nome do profile"
            variant="outlined"
            size='small'
            fullWidth
            autoComplete="new-password"
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                ProfileNameSchema,
                setName,
                setNameErr
              )
            }
            value={name}
            error={nameErr !== ''}
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
            {nameErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="apiBaseUrl"
            label="API Base URL"
            variant="outlined"
            size='small'
            fullWidth
            required
            value={apiBaseUrl}
            onChange={(e) => handleFieldChange(
              e.target.value,
              ApiBaseUrlSchema,
              setApiBaseUrl,
              setApiBaseUrlErr
            )}
            placeholder="http://{{DEVICE_IP_ADDRESS}}/api"
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            width="100%"
            align="left"
          >
            {apiBaseUrlErr}
          </Typography>
        </Box>
        <Box mt={2}>
          <Typography variant="body2" mt={2}>Tabela de Estações (SNMP)</Typography>
          <Typography
          variant="caption"
          color="textSecondary"
          display="block"
          sx={{ mb: 1.5,display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            Aponte o OID referente as informações de estações conectadas.
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            label="OID Raiz"
            required
            size='small'
            fullWidth
            sx={{ mt: 1 }}
            value={stationTable?.root_oid || ""}
            onChange={(e) => setStationField("root_oid", e.target.value, RootOIDSchema, setRootOidErr)}
            placeholder="ex: 1.3.6.1.4.1.x.x"
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            width="100%"
            align="left"
          >
            {rootOidErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            label="Índice OID (opcional)"
            size='small'
            fullWidth
            sx={{ mt: 1 }}
            value={stationTable.index_from ?? ""}
            onChange={(e) => setStationField("index_from", e.target.value, IndexFromSchema, setIndexFromErr)}
            placeholder="padrão: vazio"
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            width="100%"
            align="left"
          >
            {indexFromErr}
          </Typography>
        </Box>
        <Box>
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>
            Mapeamento de Campos Por índice OID
          </Typography>
          <Typography
          variant="caption"
          color="textSecondary"
          display="block"
          sx={{ mb: 1.5,display: 'flex', flexDirection: 'row', alignItems: 'center', textJustify: 'auto' }}
          >
            Mapeie estações por meio da tabela SNMP definida pela OID Raiz e por seus índices.{' '}
            <Tooltip sx={{ml: 1}} title={<Typography variant='caption' fontSize={'small'}>
            Por exemplo:<br></br><br></br>
            OID Raiz = 1.3.6.1.4.1.1<br></br>
            Index from = vazio (aponta a posição onde se verifica o índice. "vazio" = se trata da próxima posição depois da raiz: 1.3.6.1.4.1.1.[indice]...)<br></br>
            Field Map = se trata dos campos para cada índice, ex: [<br></br>
            {' '}'1': 'mac',<br></br>
            {' '}'2': 'assoc',<br></br>
            {' '}'3': 'tx_bytes',<br></br>
            {' '}'4': 'rx_bytes',<br></br>
            {' '}'5': 'rssi',<br></br>
            {' '}'6': 'snr'<br></br>
            ]
            </Typography>}>
              <InfoOutlinedIcon fontSize='small'></InfoOutlinedIcon>
            </Tooltip><br></br>
          </Typography>
          <Typography variant='caption' color='textSecondary' display={'block'} sx={{textJustify: 'auto'}}>
          Lembre-se que apontar o campo do MAC da estação é primordial para o seu discovery (estações sem MAC mapeado são descartadas).
          Para mapear o MAC utilize: mac, mac_address, mac_addr.
          </Typography>
          </Box>
          <Box
            display={'flex'}
            flexDirection={'row'}
            width={'100%'}
            gap={1}
            alignItems={'center'}
            mb={1.5}
            mt={2}
          >
            <Box display="flex" flexDirection="column" width={'40%'}>
              <TextField
                size="small"
                label="Índice OID"
                value={fieldMapKey}
                onChange={(e) => handleFieldChange(
                  e.target.value, FieldMapKeySchema, setFieldMapKey, setFieldMapKeyErr
                )}
                fullWidth
              />
              <Typography
                variant="caption"
                color={theme.palette.error.main}
                m={0}
                fontSize="small"
                width="100%"
                align="left"
              >
                {fieldMapKeyErr}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" width={'40%'}>
              <TextField
                fullWidth
                size="small"
                label="Campo da estação"
                value={fieldMapValue}
                onChange={(e) => handleFieldChange(
                  e.target.value, FieldMapValueSchema, setFieldMapValue, setFieldMapValueErr
                )}
              />
              <Typography
                variant="caption"
                color={theme.palette.error.main}
                m={0}
                fontSize="small"
                width="100%"
                align="left"
              >
                {fieldMapValueErr}
              </Typography>
            </Box>
            <Box height={'100%'} display={'flex'}>
              <Tooltip title="Adicionar Mapeamento">
                <span>
                  {' '}
                  <IconButton
                    color="success"
                    size='large'
                    disabled={!fieldMapKey.trim() || !fieldMapValue.trim()}
                    onClick={() => {
                      setStationField("field_map", {
                        ...stationTable.field_map,
                        [fieldMapKey]: fieldMapValue,
                      });
                      setFieldMapKey("");
                      setFieldMapValue("");
                    }}
                  >
                    <AddBoxOutlinedIcon fontSize='large'/>
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Card
            sx={{
              pt: 1.5,
              pb: 1.5,
              pr: 0.5,
              pl: 0.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              maxHeight: '20vh',
              minHeight: '15vh',
            }}
          >
            <CardContent
              sx={{ overflow: 'auto', width: '100%', p: 0.5, pb: 0 }}
            >
              {Object.entries(stationTable.field_map).length > 0 ? (
                <List
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 0,
                }}
                >
                  {Object.entries(stationTable.field_map ?? {}).map(([k, v]) => (
                  <ListItem
                    key={k}
                    sx={{
                      background: alpha(theme.palette.primary.light, 0.5),
                      borderRadius: 1,
                      py: 0.5,
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => {
                          const updated = { ...stationTable.field_map };
                          delete updated[k];
                          setStationField("field_map", updated);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={k} secondary={v} />
                  </ListItem>
              ))}
                </List>
              ) : (
                <Box
                  height={'15vh'}
                  display={'flex'}
                  flexDirection={'column'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Typography
                    variant="button"
                    fontSize={'small'}
                    color={alpha(theme.palette.text.primary, 0.5)}
                  >
                    Campos mapeados aparecerão aqui
                  </Typography>
                  <ListOutlinedIcon
                    fontSize="small"
                    sx={{
                      fill: alpha(theme.palette.text.primary, 0.5),
                    }}
                  />
                </Box>
              )}

            </CardContent>
          </Card>
        </Box>

        <Box display="flex" flexDirection="column" mt={2}>
          <ProfileActionsList actions={actions} setActions={setActions} />
        </Box>
        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{ marginTop: '1rem' }}
          disabled={!name || !apiBaseUrl || !stationTable || stationTable.root_oid === '' || !(Object.keys(stationTable.field_map).length > 0) || !(Object.keys(actions).length > 0)}
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
      </DialogContent>
      <Backdrop
        sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
        open={isLoading || isLoadingUpdate}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
};
