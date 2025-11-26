/* eslint-disable react-hooks/exhaustive-deps */
import { useTheme } from '@mui/material';
import ApexCharts, { ApexOptions } from 'apexcharts';
import * as ptBR from 'apexcharts/dist/locales/pt-br.json';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useAppThemeContext } from '../../contexts';
import { backendUrl } from '../../ts/enums';
import { IEventData } from '../../ts/interfaces';

export const ConnectedCPEsChart = () => {
  const theme = useTheme();
  const { themeName } = useAppThemeContext();

  const [seriesData, setSeriesData] = useState<Array<IEventData>>([]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      id: 'conn-cpes-chart',
      fontFamily: theme.typography.button.fontFamily,
      foreColor: theme.palette.text.primary,
      locales: [ptBR],
      defaultLocale: 'pt-br',
    },
    tooltip: {
      theme: themeName,
      shared: true,
      x: {
        show: true,
        format: 'dd/MM/yyyy HH:mm:ss',
      },
    },
    title: {
      text: 'CPEs Conectadas',
      style: {
        fontWeight: 50,
        fontFamily: 'Nunito Sans',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
      },
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: (value) => value.toFixed(0),
        style: {
          fontFamily: 'Nunito Sans',
        },
      },
    },
    series: [
      {
        name: 'CPEs_number',
        data: seriesData,
      },
    ],
    noData: {
      text: 'Carregando...',
    },
  };

  const series = [
    {
      name: 'connected-cpes',
      color: theme.palette.graphs.main,
      data: [],
    },
  ];

  useEffect(() => {
    const evtSource = new EventSource(`${backendUrl}/devices/chart-data`);

    evtSource.addEventListener('new_message', (event) => {
      const eventData = JSON.parse(event.data);

      seriesData.push(eventData);

      setSeriesData(seriesData);

      ApexCharts.exec('conn-cpes-chart', 'updateSeries', [
        {
          data: seriesData,
          animate: true,
        },
      ]);
    });

    return () => {
      evtSource.close();
      ApexCharts.exec('conn-cpes-chart', 'destroy');
    };
  }, []);

  return (
    <ReactApexChart options={chartOptions} series={series} height="100%" />
  );
};
