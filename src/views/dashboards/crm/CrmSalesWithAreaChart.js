// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Import
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import Translations from 'src/layouts/components/Translations'

const series = [{ data: [40, 20, 65, 50] }]

const CrmSalesWithAreaChart = () => {
  // ** Hook
  const theme = useTheme()

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    grid: {
      show: false,
      padding: {
        top: 5,
        bottom: 20
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityTo: 0,
        opacityFrom: 1,
        shadeIntensity: 1,
        stops: [0, 100],
        colorStops: [
          [
            {
              offset: 0,
              opacity: 0.4,
              color: theme.palette.success.main
            },
            {
              opacity: 0,
              offset: 100,
              color: theme.palette.background.paper
            }
          ]
        ]
      }
    },
    theme: {
      monochrome: {
        enabled: true,
        shadeTo: 'light',
        shadeIntensity: 1,
        color: theme.palette.success.main
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: { show: false }
  }

  return (
    <Card>
      <CardContent sx={{ pb: 0 }}>
        <Typography variant='h5'>
          <Translations text='Sales' />
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.disabled' }}>
          <Translations text='Last Year' />
        </Typography>
      </CardContent>
      <ReactApexcharts type='area' height={96} series={series} options={options} />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Sum the series */}
          <Typography variant='h4'>{series[0].data.reduce((acc, curr) => acc + curr)}k</Typography>
          <Typography variant='body2' sx={{ color: 'error.main' }}>
            -17.3%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CrmSalesWithAreaChart
