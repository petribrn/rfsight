import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
import { UserCreationForm } from './UserCreationForm';

interface IProps {
  open: boolean;
  handleClose: () => void;
}

export const UserCreationDialog = ({open, handleClose}:IProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{paper: {
        component: 'div',
        sx: { p: 2, width: { xs: '80vw', sm: '80vw', md: '70vw', lg: '60vw' } },
      }}}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">Novo Usuário</Typography>
          <Tooltip title="Fechar">
            <IconButton onClick={() => {
              handleClose();
            }}>
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <UserCreationForm />
      </DialogContent>
    </Dialog>
  );
}
