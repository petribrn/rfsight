import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Button,
  Divider,
  Grid,
  Input,
  MenuItem,
  Select,
  Slider,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

const operationModes = [
  {
    name: 'Access point (auto WDS)',
    key: 'apAutoWDS',
  },
  {
    name: 'Access point (TDMA 3)',
    key: 'apTDMA3',
  },
  {
    name: 'Cliente (WDS/TDMA 3)',
    key: 'clientWDSTDMA3',
  },
  {
    name: 'Cliente (ARPNAT)',
    key: 'clientARPNAT',
  },
];

export const WirelessConfigTab = () => {
  // Constants
  const theme = useTheme();

  // States
  const [radioEnabled, setRadioEnabled] = useState(true);
  const [country, setCountry] = useState('BR');
  const [operationMode, setOperationMode] = useState('apAutoWDS');
  const [atpcOn, setatpcOn] = useState(false);
  const [channels, setChannels] = useState([5745]);
  const [channelWidth, setChannelWidth] = useState(80);
  const [channelExtension, setChannelExtension] = useState('upper');
  const [txPower, setTxPower] = useState(27);
  const [targetSignalLevel, setTargetSignalLevel] = useState(-40);
  const [atpcPeriod, setAtpcPeriod] = useState(1000);

  const getChannelText = (channel: number) => {
    return `[CHANNEL NUMBER] (${channel} MHz)`;
  };

  const getChannelExtensionText = (width: number, extension: string) => {
    if (width === 40) {
      return extension === 'upper' ? 'Acima' : 'Abaixo';
    }
    return '';
  };

  const handleTxPowerSliderChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    setTxPower(newValue as number);
  };

  const handleTxPowerInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTxPower(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleTxPowerBlur = () => {
    if (txPower < 3) {
      setTxPower(3);
    } else if (txPower > 27) {
      setTxPower(27);
    }
  };

  const handleTargetSignalLevelSliderChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    setTargetSignalLevel(newValue as number);
  };

  const handleTargetSignalLevelInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTargetSignalLevel(
      event.target.value === '' ? 0 : Number(event.target.value)
    );
  };

  const handleTargetSignalLevelBlur = () => {
    if (targetSignalLevel < -70) {
      setTargetSignalLevel(-70);
    } else if (targetSignalLevel > -40) {
      setTargetSignalLevel(-40);
    }
  };

  const handleAtpcPeriodInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTxPower(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleAtpcPeriodBlur = () => {
    if (atpcPeriod < 1000) {
      setTargetSignalLevel(1000);
    } else if (atpcPeriod > 60000) {
      setTargetSignalLevel(60000);
    }
  };

  return (
    <Box display="flex" flexDirection="column">
      <Typography variant="button" mb={2} sx={{ fontSize: '1rem' }}>
        Configurações da wireless
      </Typography>
      <Grid container columns={3} p={2}>
        <Grid
          container
          columns={12}
          justifyContent="left"
          alignContent="left"
          alignItems="left"
        >
          <Grid item xs={4} display="flex" alignItems="center">
            <Typography textAlign="center">Ativar rádio:</Typography>
            <Switch
              checked={radioEnabled}
              onClick={() => setRadioEnabled(!radioEnabled)}
            />
          </Grid>
          <Grid item xs={2} display="flex" alignItems="center">
            <Typography textAlign="center">País:</Typography>
            <Button sx={{ ml: 2 }} variant="contained" color="secondary">
              {country}
            </Button>
          </Grid>
          <Grid item xs={7} display="flex" alignItems="center" mt={2}>
            <Typography textAlign="center">Modo de operação:</Typography>
            <Select
              value={operationMode}
              size="small"
              sx={{ width: '40%', ml: 2 }}
              onChange={(e) => setOperationMode(e.target.value)}
            >
              {operationModes.map((opMode) => (
                <MenuItem value={opMode.key} key={opMode.key}>
                  {opMode.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
        <Grid item xs={3} mt={3}>
          <Typography
            color={alpha(theme.palette.text.primary, 0.5)}
            variant="button"
          >
            Configurações de rádio
          </Typography>
          <Divider
            textAlign="left"
            flexItem
            sx={{ color: alpha(theme.palette.text.primary, 0.5) }}
          />
        </Grid>

        <Grid
          container
          columns={12}
          justifyContent="left"
          alignContent="left"
          alignItems="left"
          gap={2}
          mt={2}
        >
          <Grid item xs={6} display="flex" alignItems="center">
            <Grid
              container
              spacing={3}
              sx={{ alignItems: 'center' }}
              alignItems="center"
            >
              <Grid item>
                <Typography textAlign="center">Potência de Tx, dBm:</Typography>
              </Grid>
              <Grid item md={4}>
                <Slider
                  value={typeof txPower === 'number' ? txPower : 0}
                  max={27}
                  min={3}
                  step={1}
                  onChange={handleTxPowerSliderChange}
                  aria-labelledby="txpower-slider"
                />
              </Grid>
              <Grid item>
                <Input
                  value={txPower}
                  size="small"
                  onChange={handleTxPowerInputChange}
                  onBlur={handleTxPowerBlur}
                  inputProps={{
                    step: 1,
                    min: 0,
                    max: 27,
                    type: 'number',
                    'aria-labelledby': 'txpower-slider',
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={5} display="flex" alignItems="center">
            <Typography textAlign="center">Canal: </Typography>
            <Button
              sx={{ ml: 2 }}
              variant="contained"
              color="secondary"
              size="small"
            >
              {channels.length > 1 ? 'Auto' : getChannelText(channels[0])} /{' '}
              {channelWidth} MHz{' '}
              {getChannelExtensionText(channelWidth, channelExtension)}
            </Button>
          </Grid>

          <Grid item xs={7} display="flex" alignItems="center">
            <Typography textAlign="center">Ativar atpc:</Typography>
            <Switch checked={atpcOn} onClick={() => setatpcOn(!atpcOn)} />
          </Grid>

          <Grid
            container
            columns={12}
            justifyContent="left"
            alignContent="left"
            alignItems="left"
            gap={2}
            display={{ xs: atpcOn ? 'flex' : 'none' }}
          >
            <Grid item xs={6} display="flex" alignItems="center">
              <Grid
                container
                spacing={3}
                sx={{ alignItems: 'center' }}
                alignItems="center"
              >
                <Grid item>
                  <Typography textAlign="center">
                    Nível de sinal desejado, dBm:
                  </Typography>
                </Grid>
                <Grid item md={4}>
                  <Slider
                    value={
                      typeof targetSignalLevel === 'number'
                        ? targetSignalLevel
                        : 0
                    }
                    max={-40}
                    min={-70}
                    step={1}
                    onChange={handleTargetSignalLevelSliderChange}
                    aria-labelledby="targetSignal-slider"
                  />
                </Grid>
                <Grid item>
                  <Input
                    value={targetSignalLevel}
                    size="small"
                    onChange={handleTargetSignalLevelInputChange}
                    onBlur={handleTargetSignalLevelBlur}
                    inputProps={{
                      step: 1,
                      min: -70,
                      max: -40,
                      type: 'number',
                      'aria-labelledby': 'targetSignal-slider',
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={7} display="flex" alignItems="center" mt={2}>
              <Typography textAlign="center">Período, ms:</Typography>
              <Input
                sx={{ ml: 2 }}
                value={atpcPeriod}
                size="small"
                onChange={handleAtpcPeriodInputChange}
                onBlur={handleAtpcPeriodBlur}
                required
                inputProps={{
                  step: 1,
                  min: 1000,
                  max: 60000,
                  type: 'number',
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={3} mt={3}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>Configurações avançadas do rádio</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>TODO!</Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};
