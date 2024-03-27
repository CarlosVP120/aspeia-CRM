import { Button, Typography } from '@mui/material'
import { Box } from '@mui/system'
import CustomChip from 'src/@core/components/mui/chip'
import UserIcon from 'src/layouts/components/UserIcon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import statusObj from './SelectColores'
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
let cuentas = []

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
        cuentas = res.data.allData
      }
    })
}

export const getColumns = (setModalMode, handleOpen) => {
  fetchTableData('contacto')
  fetchTableData('cuenta')

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
      minWidth: 120,
      field: 'responsable',
      headerName: 'Responsable',
      renderCell: params => {
        // const status = statusObj[params.row.status]

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
      minWidth: 200,
      field: 'valor_del_acuerdo',
      headerName: 'Valor del Acuerdo',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            $ {params.row.valor_del_acuerdo}
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
      field: 'cuentas',
      minWidth: 200,
      headerName: 'Cuentas',
      renderCell: params => {
        // Find in cuentas the cuentas names that matches the id
        const cuentasToMap = params?.row?.cuentas?.map(cuenta => {
          const cuentaName = cuentas?.find(c => c.id === cuenta)

          return cuentaName?.nombre
        })

        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {params.row.cuentas?.length > 1 ? (
              <>
                {/* Map */}
                {cuentasToMap.slice(0, 1).map((cuenta, index) => (
                  <Box sx={{ display: 'flex', gap: 1 }} key={index}>
                    <CustomChip
                      size='small'
                      label={cuenta}
                      color='chipCuentas'
                      icon={<UserIcon icon={'tabler:building-skyscraper'} />}
                    />
                  </Box>
                ))}
                {/* Show how many are left */}
                <CustomChip size='small' label={`+${cuentasToMap.length - 1}`} color='chipCuentas' />
              </>
            ) : (
              cuentasToMap?.map((cuenta, index) => (
                <CustomChip
                  key={index}
                  size='small'
                  label={cuenta}
                  color='chipCuentas'
                  icon={<UserIcon icon={'tabler:building-skyscraper'} />}
                />
              ))
            )}
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'fecha_cierre',
      headerName: 'Fecha de Cierre',
      minWidth: 200,
      renderCell: params => (
        <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.fecha_cierre}
        </Typography>
      )
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
      field: 'probabilidad_cierre',
      minWidth: 150,
      headerName: 'Probabilidad de Cierre',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.probabilidad_cierre}%
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'duracion_acuerdo',
      minWidth: 150,
      headerName: 'Duración del Acuerdo',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.duracion_acuerdo} días
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'valor_previsto',
      minWidth: 150,
      headerName: 'Valor Previsto',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            $ {params.row.valor_previsto}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'valor_real',
      minWidth: 150,
      headerName: 'Valor Real',
      renderCell: params => {
        return (
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            $ {params.row.valor_real}
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
