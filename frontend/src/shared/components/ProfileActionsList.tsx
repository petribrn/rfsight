import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LayersIcon from '@mui/icons-material/Layers';
import {
  alpha,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { IProfileActionsListProps } from '../ts/interfaces';
import { ActionToEdit, ProfileAction } from '../ts/types';
import { ActionDialog } from './ActionDialog';

export const ProfileActionsList = ({
  actions,
  setActions,
}: IProfileActionsListProps) => {
  const theme = useTheme();

  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [dialogOperation, setDialogOperation] = useState<'create' | 'edit'>(
    'create'
  );
  const [actionToEdit, setActionToEdit] = useState<ActionToEdit | undefined>(
    undefined
  );

  // --- Handlers for Dialog ---
  const handleOpenCreateDialog = () => {
    setActionToEdit(undefined);
    setDialogOperation('create');
    setOpenActionDialog(true);
  };

  const handleOpenEditDialog = (actionName: string) => {
    const actionData = actions[actionName];
    if (actionData) {
      setActionToEdit({ name: actionName, actionData: actionData });
      setDialogOperation('edit');
      setOpenActionDialog(true);
    }
  };

  const handleCloseActionDialog = () => {
    setOpenActionDialog(false);
    setActionToEdit(undefined);
  };

  const handleUpsertAction = (
    originalName: string | undefined,
    newName: string,
    actionData: ProfileAction
  ) => {
    setActions((prevActions) => {
      const newActions = { ...prevActions };
      const trimmedNewName = newName.trim();

      // Make sure only one action for auth exists
      if (actionData.actionType === 'auth') {
        if (
          Object.keys(newActions)
            .map((key) => {
              return newActions[key].actionType === 'auth' &&
                key !== trimmedNewName
                ? key
                : null;
            })
            .filter(Boolean).length > 0
        ) {
          toast.error(
            'Já existe uma ação de autenticação para esse profile. (Limite: 1)'
          );
          return prevActions;
        }
      }

      // Check for name conflicts before proceeding
      if (originalName !== trimmedNewName && newActions[trimmedNewName]) {
        toast.error(`Ação "${trimmedNewName}" já existe.`);
        return prevActions; // Abort update if new name conflicts
      }

      // If name changed during edit, remove the old entry
      if (
        originalName &&
        originalName !== trimmedNewName &&
        newActions[originalName]
      ) {
        delete newActions[originalName];
      }

      // Add/Update the entry with the new name and data
      newActions[trimmedNewName] = actionData;
      toast.success(
        originalName
          ? `Ação "${trimmedNewName}" atualizada.`
          : `Ação "${trimmedNewName}" criada.`
      );
      return newActions;
    });
    handleCloseActionDialog();
  };

  const handleDeleteAction = (actionName: string) => {
    setActions((prevActions) => {
      const newActions = { ...prevActions };
      if (newActions[actionName]) {
        delete newActions[actionName];
        toast.info(`Ação "${actionName}" removida.`);
      }
      return newActions;
    });
  };

  const actionNames = Object.keys(actions);

  return (
    <Box>
      <Box
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        mb={1.5}
      >
        <Typography variant="button">Ações ({actionNames.length})</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          color="success"
          onClick={handleOpenCreateDialog}
        >
          Nova ação
        </Button>
      </Box>

      <Card
        variant="outlined"
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
        <CardContent sx={{ overflow: 'auto', width: '100%', p: 0.5, pb: 0 }}>
          {actionNames.length > 0 ? (
            <List
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 0,
              }}
            >
              {actionNames.map((actionName) => (
                <ListItem
                  key={actionName}
                  sx={{
                    background: alpha(theme.palette.primary.light, 0.5),
                    borderRadius: 1,
                    py: 0.5,
                  }}
                  secondaryAction={
                    <ButtonGroup sx={{ gap: 1 }}>
                      {' '}
                      <Tooltip title="Editar Ação">
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          size="small"
                          onClick={() => handleOpenEditDialog(actionName)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remover Ação">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          size="small"
                          onClick={() => handleDeleteAction(actionName)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ButtonGroup>
                  }
                >
                  <ListItemText
                    primary={actionName}
                    secondary={`Tipo: ${actions[actionName].actionType} | Protocolo: ${actions[actionName].protocol}`}
                    slotProps={{
                      primary: {
                        variant: 'body2',
                        fontWeight: 'medium',
                      },
                      secondary: { variant: 'caption' },
                    }}
                  />
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
                Ações adicionadas aparecerão aqui
              </Typography>
              <LayersIcon
                fontSize="small"
                sx={{ fill: alpha(theme.palette.text.primary, 0.5) }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
      <ActionDialog
        open={openActionDialog}
        operation={dialogOperation}
        actionToEdit={actionToEdit}
        handleClose={handleCloseActionDialog}
        upsertAction={handleUpsertAction}
      />
    </Box>
  );
};
