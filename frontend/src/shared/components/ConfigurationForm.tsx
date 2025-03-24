import { useEffect } from 'react';
import { useGetDeviceConfigByIdQuery } from '../store/slices/device/deviceApiSlice';
import { ConfigurationTabs } from './Configuration/ConfigurationTabs';

interface Props {
  configId: string;
  deviceId: string;
}

export const ConfigurationForm = ({ configId, deviceId }: Props) => {
  const { data: deviceConfig, isLoading } =
    useGetDeviceConfigByIdQuery(deviceId);

  useEffect(() => {
    if (deviceConfig) {
      console.log(deviceConfig);
    }
  }, [deviceConfig]);

  return <ConfigurationTabs />;
  // eslint-disable-next-line no-nested-ternary
  // return deviceConfig ? (
  //   <ConfigurationTabs />
  // ) : isLoading ? (
  //   <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open>
  //     <CircularProgress color="inherit" />
  //   </Backdrop>
  // ) : (
  //   <Typography>{configId}</Typography>
  // );
};
