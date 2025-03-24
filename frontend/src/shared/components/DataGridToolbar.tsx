import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

export const DataGridToolbar = () => {
  return (
    <GridToolbarContainer sx={{ justifyContent: 'right' }}>
      <GridToolbarQuickFilter placeholder="Pesquisar" />
    </GridToolbarContainer>
  );
};
