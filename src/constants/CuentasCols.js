import { Button, Typography } from '@mui/material'
import { Box } from '@mui/system'
import CustomChip from 'src/@core/components/mui/chip'
import UserIcon from 'src/layouts/components/UserIcon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import statusObj, { tipoObj } from './SelectColores'
import routesConfig from 'src/configs/routes'
import axios from 'axios'

const renderClient = params => {
  console.log('params', params.row)
  const { row } = params

  // // Map the color using the statusObj
  const color = statusObj[row.prioridad].color

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

let contactos = []
let acuerdos = []

const fetchTableData = async ENTITY => {
  await axios
    .get(routesConfig.getEntities, {
      params: {
        entity: ENTITY
      }
    })
    .then(res => {
      if (ENTITY === 'contacto') {
        contactos = res.data.allData
      } else {
        acuerdos = res.data.allData
      }
    })
}

export const getColumns = (setModalMode, handleOpen) => {
  fetchTableData('contacto')
  fetchTableData('oportunidad')

  return
  ;[
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
      minWidth: 150,
      field: 'dominio',
      headerName: 'Dominio',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.dominio}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'contactos',
      minWidth: 200,
      headerName: 'Contactos',
      renderCell: params => {
        const contactosToMap = params?.row?.contactos?.map(contacto => {
          const contactoName = contactos?.find(o => o.id === contacto)

          return contactoName?.nombre
        })

        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {params.row.contactos?.length > 1 ? (
              <>
                {/* Map */}
                {contactosToMap?.slice(0, 1).map((cuenta, index) => (
                  <Box sx={{ display: 'flex', gap: 1 }} key={index}>
                    <CustomChip
                      size='small'
                      label={cuenta}
                      color='chipCuentas'
                      icon={<UserIcon icon={'tabler:users'} />}
                    />
                  </Box>
                ))}
                {/* Show how many are left */}
                <CustomChip size='small' label={`+${contactosToMap?.length - 1}`} color='chipCuentas' />
              </>
            ) : (
              contactosToMap?.map((cuenta, index) => (
                <CustomChip
                  key={index}
                  size='small'
                  label={cuenta}
                  color='chipCuentas'
                  icon={<UserIcon icon={'tabler:users'} />}
                />
              ))
            )}
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'acuerdos',
      headerName: 'Acuerdos',
      minWidth: 230,
      renderCell: params => {
        // Find in acuerdos the acuerdos names that matches the id
        const acuerdosToMap = params?.row?.acuerdos?.map(oportunidad => {
          const oportunidadName = acuerdos?.find(o => o.id === oportunidad)

          return oportunidadName?.nombre
        })

        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {params.row.acuerdos?.length > 1 ? (
              <>
                {/* Map */}
                {acuerdosToMap.slice(0, 1).map((cuenta, index) => (
                  <CustomChip
                    key={index}
                    size='small'
                    label={cuenta}
                    icon={<UserIcon icon={'tabler:coin'} />}
                    color='chipAcuerdos'
                  />
                ))}
                {/* Show how many are left */}
                <CustomChip size='small' label={`+${acuerdosToMap.length - 1}`} color='chipAcuerdos' />
              </>
            ) : (
              acuerdosToMap?.map((cuenta, index) => (
                <CustomChip
                  key={index}
                  size='small'
                  label={cuenta}
                  icon={<UserIcon icon={'tabler:coin'} />}
                  color='chipAcuerdos'
                />
              ))
            )}
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'prioridad',
      minWidth: 130,
      headerName: 'Prioridad',
      renderCell: params => {
        const color = statusObj[params.row.prioridad].color

        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            label={params.row.prioridad}
            color={color}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'sector',
      headerName: 'Sector',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.sector}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'tipo',
      headerName: 'Tipo',
      renderCell: params => {
        const color = tipoObj[params.row.tipo].color

        return (
          <CustomChip
            rounded
            size='small'
            skin='dark'
            label={params.row.tipo}
            color={color}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      flex: 1,
      field: 'descripcion',
      minWidth: 150,
      headerName: 'Descripción',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.descripcion}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      minWidth: 200,
      field: 'cantidad_empleados',
      headerName: 'Cantidad de Empleados',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.cantidad_empleados}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'ubicacion',
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
