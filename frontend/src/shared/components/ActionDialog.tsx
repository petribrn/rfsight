import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SettingsEthernetOutlinedIcon from '@mui/icons-material/SettingsEthernetOutlined';
import {
  alpha,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Joi from 'joi';
import { useEffect, useState } from 'react';
import { IActionDialogProps } from '../ts/interfaces';
import {
  defaultAction,
  defaultHttpDetails,
  defaultSshDetails,
} from '../ts/states';
import { HttpDetails, ProfileAction, SshDetails } from '../ts/types';
import { ActionSchema } from '../ts/validation';

export const ActionDialog = ({
  open,
  operation,
  actionToEdit,
  handleClose,
  upsertAction,
}: IActionDialogProps) => {
  const theme = useTheme();
  const [currentActionName, setCurrentActionName] = useState('');
  const [currentActionData, setCurrentActionData] =
    useState<ProfileAction>(defaultAction);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [mappingKey, setMappingKey] = useState('');
  const [mappingValuePath, setMappingValuePath] = useState('');

  useEffect(() => {
    if (open && operation === 'edit' && actionToEdit) {
      setCurrentActionName(actionToEdit.name);
      setCurrentActionData({
        ...actionToEdit.actionData,
        httpDetails:
          actionToEdit.actionData.protocol === 'http'
            ? { ...defaultHttpDetails, ...actionToEdit.actionData.httpDetails }
            : null,
        sshDetails:
          actionToEdit.actionData.protocol === 'ssh'
            ? { ...defaultSshDetails, ...actionToEdit.actionData.sshDetails }
            : null,
      });
    } else if (open && operation === 'create') {
      setCurrentActionName('');
      setCurrentActionData(defaultAction);
    }
    setFormErrors({});
  }, [open, operation, actionToEdit]);

  // --- Handlers ---
  const handleFormChange = (
    field: keyof ProfileAction | keyof HttpDetails | keyof SshDetails,
    value: any,
    detailsType?: 'httpDetails' | 'sshDetails'
  ) => {
    setCurrentActionData((prev) => {
      const updatedAction = { ...prev };
      if (detailsType) {
        if (!updatedAction[detailsType]) {
          updatedAction[detailsType] =
            detailsType === 'httpDetails'
              ? JSON.parse(JSON.stringify(defaultAction.httpDetails ?? null))
              : JSON.parse(JSON.stringify(defaultAction.sshDetails ?? null));
        }
        (updatedAction[detailsType] as any)[field] = value;
        if (field === 'protocol') {
          if (value === 'http') {
            updatedAction.httpDetails = updatedAction.httpDetails ?? {
              ...defaultHttpDetails,
            };
            updatedAction.sshDetails = null;
          } else if (value === 'ssh') {
            updatedAction.sshDetails = updatedAction.sshDetails ?? {
              ...defaultSshDetails,
            };
            updatedAction.httpDetails = null;
          }
        }
      } else {
        (updatedAction as any)[field] = value;
      }
      if (field === 'protocol') {
        if (value === 'http') {
          updatedAction.httpDetails = updatedAction.httpDetails ?? {
            ...defaultHttpDetails,
          };
          updatedAction.sshDetails = null;
        } else if (value === 'ssh') {
          updatedAction.sshDetails = updatedAction.sshDetails ?? {
            ...defaultSshDetails,
          };
          updatedAction.httpDetails = null;
        }
      }
      return updatedAction;
    });
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentActionName(event.target.value);
    setFormErrors((prev) => ({ ...prev, actionName: '' }));
  };

  const handleAddMapping = () => {
    const key = mappingKey.trim();
    const value = mappingValuePath.trim();
    if (!key || !value) {
      // Optional: Add specific error state for mapping inputs
      setFormErrors((prev) => ({
        ...prev,
        responseMapping: 'Chave e Valor do Mapeamento são obrigatórios.',
      }));
      return;
    }
    if (currentActionData.httpDetails?.responseMapping?.[key]) {
      setFormErrors((prev) => ({
        ...prev,
        responseMapping: `Chave de mapeamento "${key}" já existe.`,
      }));
      return;
    }

    handleFormChange(
      'responseMapping',
      {
        ...(currentActionData.httpDetails?.responseMapping ?? {}),
        [key]: value,
      },
      'httpDetails'
    );

    // Clear inputs and error
    setMappingKey('');
    setMappingValuePath('');
    setFormErrors((prev) => ({ ...prev, responseMapping: '' }));
  };

  const handleRemoveMapping = (keyToRemove: string) => {
    if (!currentActionData.httpDetails?.responseMapping) return;

    const newMapping = { ...currentActionData.httpDetails.responseMapping };
    delete newMapping[keyToRemove];
    handleFormChange('responseMapping', newMapping, 'httpDetails');
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement | HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setFormErrors({});

    const trimmedActionName = currentActionName.trim();
    console.log(trimmedActionName);

    if (!trimmedActionName) {
      setFormErrors((prev) => ({
        ...prev,
        actionName: 'Nome da Ação é obrigatório.',
      }));
      return;
    }

    const {
      error: validationError,
      value: validatedActionData,
    }: Joi.ValidationResult = ActionSchema.validate(currentActionData, {
      abortEarly: false,
    });

    if (validationError) {
      const newErrors: Record<string, string> = {};
      validationError.details.forEach((detail) => {
        const key = detail.path.join('.') || 'general';
        newErrors[key] = detail.message;
      });
      if (!trimmedActionName)
        newErrors.actionName = 'Nome da Ação é obrigatório.';
      setFormErrors(newErrors);
      return;
    }

    upsertAction(
      operation === 'edit' ? actionToEdit?.name : undefined,
      trimmedActionName,
      validatedActionData as ProfileAction
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: 'form',
          sx: {
            p: 2,
            width: { xs: '80vw', sm: '80vw', md: '70vw', lg: '60vw' },
            maxHeight: '85vh',
          },
        },
      }}
      onSubmit={handleSubmit}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {operation === 'create'
              ? 'Criar Nova Ação'
              : `Editar Ação: ${actionToEdit?.name}`}
          </Typography>
          <Tooltip title="Fechar">
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ overflow: 'auto' }}>
        <Box sx={{ pt: 1 }} display={'flex'} flexDirection={'column'} gap={2}>
          <Box>
            <TextField
              fullWidth
              label="Nome da Ação (único)"
              value={currentActionName}
              onChange={handleNameChange}
              error={!!formErrors.actionName}
              helperText={formErrors.actionName}
              required
              autoFocus
            />
          </Box>
          <Box>
            <FormControl fullWidth error={!!formErrors.actionType} required>
              <InputLabel id="action-type-label-dialog">Tipo</InputLabel>
              <Select
                labelId="action-type-label-dialog"
                value={currentActionData.actionType}
                label="Tipo"
                onChange={(e) =>
                  handleFormChange('actionType', e.target.value as string)
                }
                required
              >
                <MenuItem value="monitor">Monitoramento</MenuItem>
                <MenuItem value="manage">Gerenciamento</MenuItem>
              </Select>
              {formErrors.actionType && (
                <Typography variant="caption" color="error" sx={{ ml: 1.75 }}>
                  {formErrors.actionType}
                </Typography>
              )}
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth error={!!formErrors.protocol} required>
              <InputLabel id="protocol-label-dialog">Protocolo</InputLabel>
              <Select
                labelId="protocol-label-dialog"
                value={currentActionData.protocol}
                label="Protocolo"
                onChange={(e) =>
                  handleFormChange('protocol', e.target.value as string)
                }
                required
              >
                <MenuItem value="http">HTTP</MenuItem>
                <MenuItem value="ssh">SSH</MenuItem>
              </Select>
              {formErrors.protocol && (
                <Typography variant="caption" color="error" sx={{ ml: 1.75 }}>
                  {formErrors.protocol}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* --- HTTP Details --- */}
          {currentActionData.protocol === 'http' &&
            currentActionData.httpDetails && (
              <>
                <Box>
                  <FormControl
                    fullWidth
                    error={!!formErrors['httpDetails.method']}
                    required
                  >
                    <InputLabel id="http-method-label-dialog">
                      Método
                    </InputLabel>
                    <Select
                      labelId="http-method-label-dialog"
                      value={currentActionData.httpDetails.method}
                      label="Método"
                      onChange={(e) =>
                        handleFormChange(
                          'method',
                          e.target.value as string,
                          'httpDetails'
                        )
                      }
                      required
                    >
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="PATCH">PATCH</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                    </Select>
                    {formErrors['httpDetails.method'] && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ ml: 1.75 }}
                      >
                        {formErrors['httpDetails.method']}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Caminho (ex: /config)"
                    value={currentActionData.httpDetails.path}
                    onChange={(e) =>
                      handleFormChange('path', e.target.value, 'httpDetails')
                    }
                    error={!!formErrors['httpDetails.path']}
                    helperText={formErrors['httpDetails.path']}
                    required
                  />
                </Box>
                <Box>
                  <FormControl
                    fullWidth
                    error={!!formErrors['httpDetails.responseType']}
                    required
                  >
                    <InputLabel id="http-response-type-label-dialog">
                      Tipo Resposta
                    </InputLabel>
                    <Select
                      labelId="http-response-type-label-dialog"
                      value={currentActionData.httpDetails.responseType}
                      label="Tipo Resposta"
                      onChange={(e) =>
                        handleFormChange(
                          'responseType',
                          e.target.value as string,
                          'httpDetails'
                        )
                      }
                      required
                    >
                      <MenuItem value="text/json">text/json</MenuItem>
                      <MenuItem value="text/plain">text/plain</MenuItem>
                      <MenuItem value="boolean">boolean (true/false)</MenuItem>
                      <MenuItem value="blank">blank (vazio)</MenuItem>
                    </Select>
                    {formErrors['httpDetails.responseType'] && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ ml: 1.75 }}
                      >
                        {formErrors['httpDetails.responseType']}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Mapeamento da Resposta (Opcional)
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                    sx={{ mb: 1.5 }}
                  >
                    Mapeie chaves da resposta JSON do dispositivo (usando '.')
                    para chaves RFSight.
                  </Typography>
                  {formErrors.responseMapping && (
                    <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                      {formErrors.responseMapping}
                    </Typography>
                  )}
                  <Box
                    display={'flex'}
                    flexDirection={'row'}
                    width={'100%'}
                    gap={1}
                    alignItems={'center'}
                    mb={1.5}
                  >
                    <TextField
                      sx={{
                        width: '40%',
                      }}
                      size="small"
                      label="Chave RFSight"
                      value={mappingKey}
                      onChange={(e) => setMappingKey(e.target.value)}
                      placeholder="ex: hostname"
                    />
                    <TextField
                      sx={{
                        width: '40%',
                      }}
                      size="small"
                      label="Caminho no Dispositivo"
                      value={mappingValuePath}
                      onChange={(e) => setMappingValuePath(e.target.value)}
                      placeholder="ex: general.deviceName"
                    />
                    <Tooltip title="Adicionar Mapeamento">
                      <span>
                        {' '}
                        <IconButton
                          onClick={handleAddMapping}
                          color="success"
                          size="small"
                          disabled={
                            !mappingKey.trim() || !mappingValuePath.trim()
                          }
                        >
                          <AddBoxOutlinedIcon fontSize="large" />
                        </IconButton>
                      </span>
                    </Tooltip>
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
                    }}
                  >
                    {Object.entries(
                      currentActionData.httpDetails.responseMapping ?? {}
                    ).length > 0 ? (
                      <List>
                        {Object.entries(
                          currentActionData.httpDetails.responseMapping ?? {}
                        ).map(([key, value]) => (
                          <ListItem>
                            <ListItem
                              key={key}
                              secondaryAction={
                                <Tooltip title="Remover">
                                  <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => handleRemoveMapping(key)}
                                  >
                                    <DeleteIcon
                                      fontSize="inherit"
                                      color="error"
                                    />
                                  </IconButton>
                                </Tooltip>
                              }
                            >
                              <ListItemText primary={key} secondary={value} />
                            </ListItem>
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
                          Mapeamentos adicionados aparecerão aqui
                        </Typography>
                        <SettingsEthernetOutlinedIcon
                          fontSize="small"
                          sx={{ fill: alpha(theme.palette.text.primary, 0.5) }}
                        />
                      </Box>
                    )}
                  </Card>
                </Box>
              </>
            )}

          {/* --- SSH Details --- */}
          {currentActionData.protocol === 'ssh' &&
            currentActionData.sshDetails && (
              <>
                <Box>
                  <TextField
                    fullWidth
                    type="number"
                    label="Porta"
                    value={currentActionData.sshDetails.port}
                    onChange={(e) =>
                      handleFormChange(
                        'port',
                        parseInt(e.target.value, 10) || 22,
                        'sshDetails'
                      )
                    }
                    error={!!formErrors['sshDetails.port']}
                    helperText={formErrors['sshDetails.port']}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Comando"
                    value={currentActionData.sshDetails.command}
                    onChange={(e) =>
                      handleFormChange('command', e.target.value, 'sshDetails')
                    }
                    error={!!formErrors['sshDetails.command']}
                    helperText={formErrors['sshDetails.command']}
                    required
                  />
                </Box>
              </>
            )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {' '}
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<CancelIcon />}
          onClick={handleClose}
        >
          Cancelar
        </Button>
        <Button variant="contained" startIcon={<SaveIcon />} type="submit">
          {' '}
          {operation === 'create' ? 'Criar Ação' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
