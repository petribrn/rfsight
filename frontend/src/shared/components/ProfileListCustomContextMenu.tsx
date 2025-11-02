import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRemoveProfileMutation } from '../store/slices/profile/profileApiSlice';
import { DefaultApiError } from '../ts/interfaces';
import { IProfileContextMenu } from '../ts/interfaces/profile.interfaces';
import { ProfileRow } from '../ts/types';
import { ConfirmationDialog } from './ConfirmationDialog';

interface Props {
  mouseX: number;
  mouseY: number;
  rowData: ProfileRow;
  target: HTMLElement;
  removeConfirmationDialogProps: {
    title: string;
    content: string;
    closeButtonText: string;
    confirmButtonText: string;
  };
  setContextMenu: Dispatch<SetStateAction<IProfileContextMenu | null>>;
}

export const ProfileListCustomContextMenu = ({
  mouseX,
  mouseY,
  rowData, // Profile data
  target,
  setContextMenu,
  removeConfirmationDialogProps,
}: Props) => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [removeProfile] = useRemoveProfileMutation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(target);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    const handleContextMenu = (e: PointerEvent) => {
      // prevent the right-click menu from appearing
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

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
  const handleEdit = () => {
    handleCloseMenu();
  };
  const handleRemove = async () => {
    handleCloseConfirmation();
    try {
      const removeProfileResult = await removeProfile(rowData.id).unwrap();
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
            list: { 'aria-labelledby': `action-button-${rowData.id}` },
          }}
          onContextMenu={(e) => e.preventDefault()}
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
