import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { GridCellParams } from '@mui/x-data-grid';
import { MouseEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { useRemoveProfileMutation } from '../store/slices/profile/profileApiSlice';
import { DefaultApiError } from '../ts/interfaces';
import { ConfirmationDialog } from './ConfirmationDialog';

export const ProfileActionsMenu = (params: GridCellParams) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [removeProfile] = useRemoveProfileMutation();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const { row } = params;
  const { id } = row;

  const handleVisualize = () => {
    handleCloseMenu();
  };
  const handleEdit = () => {
    handleCloseMenu();
  };
  const handleRemove = async () => {
    handleCloseConfirmation();
    try {
      const removeProfileResult = await removeProfile(id).unwrap();
      if (removeProfileResult) toast.success(removeProfileResult.message);
      handleCloseMenu();
      return true;
    } catch (error) {
      const err = error as DefaultApiError;
      toast.error(err.detail.message);
      return false;
    }
  };

  return (
    <Box>
      <IconButton
        id={`action-button-${id}`}
        aria-controls={menuOpen ? `action-menu-${id}` : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={handleClick}
        color="primary"
      >
        <KeyboardArrowDownIcon />
      </IconButton>
      <Menu
        id={`action-menu-${id}`}
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        slotProps={{
          list: {
            'aria-labelledby': `action-button-${id}`,
          }
        }}
      >
        <MenuItem onClick={handleVisualize}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          Visualizar
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setConfirmationDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Remover
        </MenuItem>
      </Menu>
      <ConfirmationDialog
        open={confirmationDialogOpen}
        handleClose={handleCloseConfirmation}
        handleConfirm={handleRemove}
        title="Deseja mesmo remover o profile?"
        content="Ao remover o profile, todos os dispositivos associados serão desativados."
        confirmButtonText="Remover"
        closeButtonText="Cancelar"
      />
    </Box>
  );
};
