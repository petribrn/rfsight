import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useExecuteActionSequenceMutation } from '../store/slices/device/deviceApiSlice';
import {
  ActionExecutionPayload,
  ActionSequenceResponse,
} from '../ts/interfaces';
import { DeviceData, ProfileData } from '../ts/types';
import { JsonPayloadEditor } from './JsonPayloadEditor';

/**
 * Reads a File object and returns its Base64-encoded string content,
 * without the "data:..." prefix.
 */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error('Falha ao ler o arquivo como Base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });

interface Props {
  device: DeviceData;
  profile: ProfileData;
}

// Extend this type for UI display
type SequenceItem = ActionExecutionPayload & {
  _payloadDisplay: string;
};

export const DeviceActionExecutor: React.FC<Props> = ({ device, profile }) => {
  const theme = useTheme();

  const [executeSequence, { isLoading }] = useExecuteActionSequenceMutation();

  const [selectedActionName, setSelectedActionName] = useState<string>('');

  const [jsonPayload, setJsonPayload] = useState<object | null>(null);
  const [plainTextPayload, setPlainTextPayload] = useState<string>('');
  const [filePayload, setFilePayload] = useState<File | null>(null);

  const [sequence, setSequence] = useState<SequenceItem[]>([]);

  const [results, setResults] = useState<ActionSequenceResponse[]>([]);

  const manageActions = useMemo(() => {
    return Object.entries(profile.actions)
      .filter(([, action]) => action.actionType === 'manage')
      .map(([name, action]) => ({ name, action }));
  }, [profile.actions]);

  const selectedActionDetails = useMemo(() => {
    return manageActions.find((a) => a.name === selectedActionName)?.action;
  }, [selectedActionName, manageActions]);

  const handleAddToActionList = async () => {
    if (!selectedActionName || !selectedActionDetails) return;

    const payloadType = selectedActionDetails.httpDetails?.payloadType;
    let finalPayload: Record<string, any> | null = null;
    let payloadDisplay: string = 'Sem payload';

    try {
      if (payloadType === 'text/json') {
        if (!jsonPayload) {
          toast.error('Payload JSON é obrigatório.');
          return;
        }
        finalPayload = jsonPayload as object;
        payloadDisplay = JSON.stringify(finalPayload);
      } else if (payloadType === 'text/plain') {
        if (!plainTextPayload.trim()) {
          toast.error('Payload de texto é obrigatório.');
          return;
        }
        finalPayload = { text_payload: plainTextPayload };
        payloadDisplay = `Texto: ${plainTextPayload.substring(0, 50)}...`;
      } else if (payloadType === 'file') {
        if (!filePayload) {
          toast.error('Arquivo é obrigatório.');
          return;
        }
        const base64String = await fileToBase64(filePayload);
        finalPayload = {
          file_payload_base64: base64String,
          filename: filePayload.name,
        };
        payloadDisplay = `Arquivo: ${filePayload.name}`;
      } else {
        finalPayload = null;
      }
    } catch (error) {
      toast.error(`Falha ao processar payload: ${error}`);
      return;
    }

    setSequence([
      ...sequence,
      {
        action_name: selectedActionName,
        payload: finalPayload,
        _payloadDisplay: payloadDisplay,
      },
    ]);

    // Reset all payload inputs
    setSelectedActionName('');
    setJsonPayload(null);
    setPlainTextPayload('');
    setFilePayload(null);
  };

  const setDefaultState = () => {
    setResults([]);
    setSequence([]);
    setSelectedActionName('');
    setJsonPayload(null);
    setPlainTextPayload('');
    setFilePayload(null);
  }

  // Handler to remove an action from the list
  const handleRemoveFromList = (indexToRemove: number) => {
    setSequence(sequence.filter((_, index) => index !== indexToRemove));
  };

  // Handler to run the entire action sequence
  const handleExecuteSequence = async () => {
    if (sequence.length === 0) return;

    setResults([]);
    try {
      const response = await executeSequence({
        deviceId: device.id,
        sequence: {
          actions: sequence.map(a => ({
            action_name: a.action_name,
            payload: a.payload
          }))
        },
      }).unwrap();

      setResults(response);

      const lastResult = response[response.length - 1];
      if (lastResult.status === 'failed') {
        toast.error(`Falha na execução: ${lastResult.message}`);
      } else {
        toast.success('Sequência executada com sucesso!');
      }
    } catch (err: any) {
      const errorMsg = (err as any).data?.detail || 'Um erro inesperado ocorreu.';
      toast.error(errorMsg);
      setResults([
        {
          action: 'Cliente',
          status: 'failed',
          message: errorMsg,
        },
      ]);
    }
  };

  const renderPayloadInput = () => {
    const httpDetails = selectedActionDetails?.httpDetails;
    if (!httpDetails) {
       return (
         <Typography variant="caption" color="textSecondary">
            Esta ação (SSH) não requer um payload JSON/Texto/Arquivo.
         </Typography>
      );
    }

    const payloadType = httpDetails.payloadType;

    switch (payloadType) {
      case 'text/json':
        return (
          <>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
              Esta ação requer um payload JSON.
            </Typography>
            <JsonPayloadEditor
              data={jsonPayload || {}}
              setData={(d) => setJsonPayload(d as object)}
              collapse={false}
            />
          </>
        );
      case 'text/plain':
        return (
          <>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
              Esta ação requer um payload de texto plano.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Payload (texto plano)"
              value={plainTextPayload}
              onChange={(e) => setPlainTextPayload(e.target.value)}
            />
          </>
        );
      case 'file':
        return (
          <>
             <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
              Esta ação requer um arquivo (ex: firmware).
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              {filePayload ? filePayload.name : 'Selecionar Arquivo'}
              <input
                type="file"
                hidden
                onChange={(e) => setFilePayload(e.target.files?.[0] || null)}
              />
            </Button>
          </>
        );
      default:
        return (
         <Typography variant="caption" color="textSecondary">
            Esta ação não requer payload.
         </Typography>
      );
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Construtor de Ações</Typography>
        <FormControl fullWidth>
          <InputLabel id="action-select-label">Selecionar Ação</InputLabel>
          <Select
            labelId="action-select-label"
            value={selectedActionName}
            label="Selecionar Ação"
            onChange={(e) => {
              setSelectedActionName(e.target.value);
              setJsonPayload(null);
              setPlainTextPayload('');
              setFilePayload(null);
            }}
          >
            {manageActions.length === 0 && (
              <MenuItem disabled>Nenhuma ação 'manage' definida.</MenuItem>
            )}
            {manageActions.map(({ name }) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedActionName && (
          <Box>
            {renderPayloadInput()}
          </Box>
        )}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddToActionList}
          disabled={!selectedActionName || isLoading}
        >
          Adicionar à Fila
        </Button>
      </Box>

      <Box>
        <Typography variant="h6">Fila de Execução</Typography>
        <List>
          {sequence.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{p: 2}}>
              Nenhuma ação na fila.
            </Typography>
          )}
          {sequence.map((action, index) => (
            <ListItem
              key={index}
              divider
              sx={{ background: alpha(theme.palette.action.hover, 0.04) }}
              secondaryAction={
                <Tooltip title="Remover">
                  <IconButton edge="end" onClick={() => handleRemoveFromList(index)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText
                primary={`${index + 1}. ${action.action_name}`}
                secondary={action._payloadDisplay}
                slotProps={{
                  secondary: {
                    sx: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '80%'
                    }
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box>
        <Button
          variant="contained"
          size="large"
          color="primary"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          onClick={results.length === 0 ? handleExecuteSequence:setDefaultState}
          disabled={sequence.length === 0 || isLoading}
          fullWidth
        >
          {isLoading ? 'Executando...' : results.length > 0 ? 'Nova execução' :`Executar ${sequence.length} Aç${sequence.length === 1 ? 'ão':'ões'}`}
        </Button>

        {results.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Resultados</Typography>
            <List>
              {results.map((result, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {result.status === 'success' ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.action}
                    secondary={result.message}
                    slotProps={{
                      secondary: {
                        color: result.status === 'failed' ? 'error' : 'textSecondary',
                        sx: { whiteSpace: 'pre-wrap' }
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
