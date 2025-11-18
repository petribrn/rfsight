// frontend/src/shared/components/DeviceActionExecutor.tsx

import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useExecuteActionSequenceMutation } from '../store/slices/device/deviceApiSlice';
import {
  ActionExecutionPayload,
  ActionSequenceResponse,
} from '../ts/interfaces';
import { DeviceData, ProfileData } from '../ts/types';
import { JsonPayloadEditor } from './JsonPayloadEditor'; // Reusing your component

interface Props {
  device: DeviceData;
  profile: ProfileData;
}

export const DeviceActionExecutor: React.FC<Props> = ({ device, profile }) => {
  const theme = useTheme();

  // 1. RTK Hook for the mutation
  const [executeSequence, { isLoading }] = useExecuteActionSequenceMutation();

  // 2. State for building the sequence
  const [selectedActionName, setSelectedActionName] = useState<string>('');
  const [currentPayload, setCurrentPayload] = useState<object | null>(null);
  const [sequence, setSequence] = useState<ActionExecutionPayload[]>([]);

  // 3. State for displaying results
  const [results, setResults] = useState<ActionSequenceResponse[]>([]);

  // Memoize the list of 'manage' actions from the profile
  const manageActions = useMemo(() => {
    return Object.entries(profile.actions)
      .filter(([, action]) => action.actionType === 'manage')
      .map(([name, action]) => ({ name, action }));
  }, [profile.actions]);

  // Get the details of the currently selected action
  const selectedActionDetails = manageActions.find(
    (a) => a.name === selectedActionName
  )?.action;

  // Handler to add an action to the sequence list
  const handleAddToActionList = () => {
    if (!selectedActionName) return;

    // Check if payload is required but not provided
    const expectsPayload = selectedActionDetails && selectedActionDetails.httpDetails?.payloadType === 'text/json';
    if (expectsPayload && !currentPayload) {
        toast.error('Payload é obrigatório para esta ação.');
        return;
    }

    setSequence([
      ...sequence,
      {
        action_name: selectedActionName,
        payload: expectsPayload ? currentPayload : null, // Only add payload if needed
      },
    ]);
    // Reset inputs
    setSelectedActionName('');
    setCurrentPayload(null);
  };

  // Handler to remove an action from the list
  const handleRemoveFromList = (indexToRemove: number) => {
    setSequence(sequence.filter((_, index) => index !== indexToRemove));
  };

  // Handler to run the entire sequence
  const handleExecuteSequence = async () => {
    if (sequence.length === 0) return;

    setResults([]); // Clear previous results
    try {
      // Call the API
      const response = await executeSequence({
        deviceId: device.id,
        sequence: { actions: sequence },
      }).unwrap();

      setResults(response); // Set results to display

      // Check the status of the *last* action
      const lastResult = response[response.length - 1];
      if (lastResult.status === 'failed') {
        toast.error(`Falha na execução: ${lastResult.message}`);
      } else {
        toast.success('Sequência executada com sucesso!');
      }
    } catch (err: any) {
      toast.error(err.data?.detail || 'Um erro inesperado ocorreu.');
      setResults([
        {
          action: 'Cliente',
          status: 'failed',
          message: err.data?.detail || 'Erro ao enviar requisição.',
        },
      ]);
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* --- 1. ACTION BUILDER --- */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Construtor de Ações</Typography>
        <FormControl fullWidth>
          <InputLabel id="action-select-label">Selecionar Ação</InputLabel>
          <Select
            labelId="action-select-label"
            value={selectedActionName}
            label="Selecionar Ação"
            onChange={(e) => setSelectedActionName(e.target.value)}
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
        {selectedActionDetails && selectedActionDetails.httpDetails?.payloadType === 'text/json' && (
          <Box>
             <Typography variant="caption" color="textSecondary" display="block" sx={{mb: 1}}>
                Esta ação requer um payload JSON.
             </Typography>
             <JsonPayloadEditor
                data={currentPayload || {}}
                setData={(d) => setCurrentPayload(d as object)}
                collapse={false}
             />
          </Box>
        )}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddToActionList}
          disabled={!selectedActionName}
        >
          Adicionar à Fila
        </Button>
      </Box>

      {/* --- 2. ACTION SEQUENCE (TO-DO LIST) --- */}
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
                secondary={action.payload ? JSON.stringify(action.payload) : 'Sem payload'}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* --- 3. EXECUTION & RESULTS --- */}
      <Box>
        <Button
          variant="contained"
          size="large"
          color="primary"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleExecuteSequence}
          disabled={sequence.length === 0 || isLoading}
          fullWidth
        >
          {isLoading ? 'Executando...' : `Executar ${sequence.length} Ação(ões)`}
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
                        color: result.status === 'failed' ? 'error' : 'textSecondary'
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
