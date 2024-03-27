import { Button, Typography } from '@mui/material'
import { Box } from '@mui/system'
import CustomChip from 'src/@core/components/mui/chip'
import UserIcon from 'src/layouts/components/UserIcon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import { leadObj } from './SelectColores'
import routesConfig from 'src/configs/routes'
import axios from 'axios'

const renderClient = params => {
  console.log('params', params.row)
  const { row } = params

  // // Map the color using the statusObj
  const color = leadObj[row.estado]?.color || 'success'

  // Select a random color from the statusObj
  //   const color = Object.values(statusObj)[Math.floor(Math.random() * Object.values(statusObj).length)].color

  if (row.avatar?.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '2.1rem', height: '2.1rem' }} />
  } else {
    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '.8rem', width: '2.1rem', height: '2.1rem' }}>
        {getInitials(row.nombre ? row.nombre : 'John Doe')}
      </CustomAvatar>
    )
  }
}

let usuarios = []

const fetchTableData = async ENTITY => {
  await axios
    .get(routesConfig.getEntities, {
      params: {
        entity: ENTITY
      }
    })
    .then(res => {
      usuarios = res.data.allData
    })
}

export const getColumns = (setModalMode, handleOpen) => {
  fetchTableData('custom_user_data')

  return [
    {
      flex: 1,
      minWidth: 250,
      field: 'nombre',
      headerName: 'Nombre',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(params)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.nombre}
              </Typography>
              <Typography noWrap variant='caption'>
                {row.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'estado',
      minWidth: 130,
      headerName: 'Estado',
      renderCell: params => {
        const color = leadObj[params.row.estado]?.color || 'success'

        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            label={params.row.estado}
            color={color}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      flex: 1,
      field: 'responsable',
      minWidth: 180,
      headerName: 'Responsable',
      renderCell: params => {
        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            label={params.row.responsable}
            color='primary'
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },

    {
      flex: 1,
      minWidth: 150,
      field: 'empresa',
      headerName: 'Empresa',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.empresa}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'puesto',
      minWidth: 180,
      headerName: 'Puesto',
      renderCell: params => {
        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            label={params.row.puesto}
            color='primary'
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },

    {
      flex: 1,
      minWidth: 200,
      field: 'email',
      headerName: 'E-Mail',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.email}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'telefono',
      minWidth: 150,
      headerName: 'Teléfono',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.telefono}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'ubicacion',
      minWidth: 150,
      headerName: 'Ubicación',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.ubicacion}
          </Typography>
        )
      }
    },

    {
      flex: 1,
      minWidth: 200,
      field: 'actions',
      headerName: 'Acciones',
      renderCell: params => {
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size='small'
              color='secondary'
              onClick={() => {
                setModalMode('View')
                handleOpen()
              }}
            >
              <UserIcon icon={'tabler:eye'} />
            </Button>
            <Button
              size='small'
              color='secondary'
              onClick={() => {
                setModalMode('Edit')
                handleOpen()
              }}
            >
              <UserIcon icon={'tabler:edit'} />
            </Button>
            <Button
              size='small'
              color='secondary'
              onClick={() => {
                setModalMode('Delete')
                handleOpen()
              }}
            >
              <UserIcon icon={'tabler:trash'} />
            </Button>
          </Box>
        )
      }
    }
  ]
}
