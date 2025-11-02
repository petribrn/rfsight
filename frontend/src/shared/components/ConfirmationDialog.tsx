/* eslint-disable react/no-unescaped-entities */
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

interface IConfirmationDialogProps {
  title: string;
  content: string;
  open: boolean;
  closeButtonText: string;
  confirmButtonText: string;
  handleClose: () => void;
  handleConfirm: () => void;
}

export const ConfirmationDialog = ({
  title,
  content,
  open,
  closeButtonText,
  confirmButtonText,
  handleClose,
  handleConfirm,
}: IConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onSubmit={handleConfirm}
      slotProps={{
        paper: {
          sx: {
            p: 2,
            width: { xs: '80vw', sm: '80vw', md: '70vw', lg: '60vw' },
          },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">{title}</Typography>
          <Tooltip title="Fechar">
            <IconButton onClick={handleClose}>
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="error"
            size="large"
            type="button"
            onClick={handleConfirm}
            sx={{ marginTop: '1rem' }}
          >
            {confirmButtonText}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            type="button"
            onClick={handleClose}
            sx={{ marginTop: '1rem' }}
          >
            {closeButtonText}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
