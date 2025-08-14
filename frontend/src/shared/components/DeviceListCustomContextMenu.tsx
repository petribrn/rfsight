import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { Dispatch, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRemoveDeviceMutation } from '../store/slices/device/deviceApiSlice';
import { DefaultApiError, IDeviceContextMenu } from '../ts/interfaces';
import { DeviceRow } from '../ts/types';
import { ConfirmationDialog } from './ConfirmationDialog';

interface Props {
  mouseX: number;
  mouseY: number;
  rowData: DeviceRow;
  target: HTMLElement;
  removeConfirmationDialogProps: {
    title: string;
    content: string;
    closeButtonText: string;
    confirmButtonText: string;
  };
  setContextMenu: Dispatch<SetStateAction<IDeviceContextMenu | null>>;
}

export const DeviceListCustomContextMenu = ({
  mouseX,
  mouseY,
  rowData,
  target,
  setContextMenu,
  removeConfirmationDialogProps,
}: Props) => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [removeDevice] = useRemoveDeviceMutation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(target);
  const menuOpen = Boolean(anchorEl);

  const navigate = useNavigate();

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setContextMenu(null);
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const handleConfigure = () => {
    handleCloseMenu();
    navigate(`/devices/${rowData.id}/configure`);
  };
  const handleRemove = async () => {
    handleCloseConfirmation();
    try {
      const removeDeviceResult = await removeDevice(rowData.id).unwrap();
      if (removeDeviceResult) toast.success(removeDeviceResult.message);
      handleCloseMenu();
      return true;
    } catch (error) {
      const err = error as DefaultApiError;
      toast.error(err.detail.message);
      return false;
    }
  };
  return (
    <Box
      sx={{
        position: 'absolute',
        top: mouseY,
        left: mouseX + 5,
        display: menuOpen ? 'flex' : 'none',
      }}
    >
      <Paper>
        <Menu
          id={`action-menu-${rowData.id}`}
          open={menuOpen}
          onClose={handleCloseMenu}
          anchorEl={target}
          anchorPosition={{ top: mouseY, left: mouseX + 5 }}
          slotProps={{
            list: {
              'aria-labelledby': `action-button-${rowData.id}`,
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <MenuItem onClick={handleConfigure}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Configurar
          </MenuItem>
          <MenuItem
            onClick={() => {
              setConfirmationDialogOpen(true);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Remover
          </MenuItem>
        </Menu>
      </Paper>
      <ConfirmationDialog
        open={confirmationDialogOpen}
        handleClose={handleCloseConfirmation}
        handleConfirm={handleRemove}
        title={removeConfirmationDialogProps.title}
        content={removeConfirmationDialogProps.content}
        confirmButtonText={removeConfirmationDialogProps.confirmButtonText}
        closeButtonText={removeConfirmationDialogProps.closeButtonText}
      />
    </Box>
  );
};
