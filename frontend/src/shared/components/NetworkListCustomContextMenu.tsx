import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';
import { useRemoveNetworkMutation } from '../store/slices/network/networkApiSlice';
import { DefaultApiError, INetworkContextMenu } from '../ts/interfaces';
import { NetworkRow } from '../ts/types';
import { ConfirmationDialog } from './ConfirmationDialog';

interface Props {
  mouseX: number;
  mouseY: number;
  rowData: NetworkRow;
  target: HTMLElement;
  removeConfirmationDialogProps: {
    title: string;
    content: string;
    closeButtonText: string;
    confirmButtonText: string;
  };
  setContextMenu: Dispatch<SetStateAction<INetworkContextMenu | null>>;
}

export const NetworkListCustomContextMenu = ({
  mouseX,
  mouseY,
  rowData,
  target,
  setContextMenu,
  removeConfirmationDialogProps,
}: Props) => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [removeNetwork] = useRemoveNetworkMutation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(target);
  const menuOpen = Boolean(anchorEl);

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setContextMenu(null);
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const handleVisualize = () => {
    handleCloseMenu();
  };
  const handleConfigure = () => {
    handleCloseMenu();
  };
  const handleRemove = async () => {
    handleCloseConfirmation();
    try {
      const removeNetworkResult = await removeNetwork(rowData.id).unwrap();
      if (removeNetworkResult) toast.success(removeNetworkResult.message);
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
            list: {'aria-labelledby': `action-button-${rowData.id}`,}
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <MenuItem onClick={handleVisualize}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            Visualizar
          </MenuItem>
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
