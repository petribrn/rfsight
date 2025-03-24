import { alpha, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { TabPanelProps } from '../ts/interfaces';
import { TabPanelPaper } from './styled/TabPanelPaper';

export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ width: '100%', height: '100%' }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3, pr: 1.5, pl: 1.5, pb: 3 }}>
          <TabPanelPaper
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.2),
            }}
          >
            {children}
          </TabPanelPaper>
        </Box>
      )}
    </div>
  );
};
