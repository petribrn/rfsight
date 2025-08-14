import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { GridCellParams } from '@mui/x-data-grid';
import { MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRemoveDeviceMutation } from '../store/slices/device/deviceApiSlice';
import { DefaultApiError } from '../ts/interfaces';
import { ConfirmationDialog } from './ConfirmationDialog';

export const DeviceActionsMenu = (params: GridCellParams) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [removeDevice] = useRemoveDeviceMutation();

  const navigate = useNavigate();

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

  const handleConfigure = () => {
    handleCloseMenu();
    navigate(`/devices/${id}/configure`);
  };
  const handleRemove = async () => {
    handleCloseConfirmation();
    try {
      const removeDeviceResult = await removeDevice(id).unwrap();
      if (removeDeviceResult) toast.success(removeDeviceResult.message);
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
        <MenuItem onClick={handleConfigure}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Configurar
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
        title="Deseja mesmo remover o dispositivo?"
        content="Ao remover o dispositivo, você perderá o acesso a configuração e atualização por meio do gerenciador."
        confirmButtonText="Remover"
        closeButtonText="Cancelar"
      />
    </Box>
  );
};
