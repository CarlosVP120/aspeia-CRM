// ** React Imports
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import FormValidationBasic from 'src/views/forms/form-validation/FormValidationBasic'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'

// ** ThirdParty Components
import axios from 'axios'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ServerSideToolbar from 'src/views/table/data-grid/ServerSideToolbar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import {
  Button,
  CardActions,
  CardContent,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  styled
} from '@mui/material'
import toast from 'react-hot-toast'
import UserIcon from 'src/layouts/components/UserIcon'
import Icon from 'src/@core/components/icon'

import routesConfig from 'src/configs/routes'
import supabase from 'src/@core/utils/supabase'
import TransitionsModal from 'src/@core/components/modal'
import MUIModal from 'src/@core/components/modified-components/dialog'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

const ENTITY = 'contacto'

// ** Full Name Getter
const getFullName = params =>
  toast(
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {renderClient(params)}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.full_name}
        </Typography>
      </Box>
    </Box>
  )

// ** renders client column
const renderClient = params => {
  const { row } = params

  // Map the color using the statusObj
  const color = statusObj[row.status].color

  if (row.avatar?.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '2.1rem', height: '2.1rem' }} />
  } else {
    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '.8rem', width: '2.1rem', height: '2.1rem' }}>
        {getInitials(row.full_name ? row.full_name : 'John Doe')}
      </CustomAvatar>
    )
  }
}

const statusObj = {
  ACTIVO: { title: 'Activo', color: 'success' },
  PERDIDO: { title: 'Perdido', color: 'error' },
  LEAD: { title: 'Lead', color: 'warning' }
}

const TableServerSide = () => {
  // ** States
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('asc')
  const [rows, setRows] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('full_name')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [showCheckboxSelection, setShowCheckboxSelection] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [entityDefs, setEntityDefs] = useState([])
  const [requiredFields, setRequiredFields] = useState([])
  const [modalMode, setModalMode] = useState('')

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const columns = [
    {
      flex: 0.1,
      minWidth: 80,
      field: 'id',
      headerName: 'ID',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.id}
        </Typography>
      )
    },

    {
      flex: 0.25,
      minWidth: 290,
      field: 'full_name',
      headerName: 'Name',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(params)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.full_name}
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
      flex: 0.1,
      type: 'date',
      minWidth: 120,
      headerName: 'Date',
      field: 'start_date',
      valueGetter: params => new Date(params.value),
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.start_date}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 110,
      field: 'salary',
      headerName: 'Salary',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.salary}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'age',
      minWidth: 80,
      headerName: 'Age',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.age}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 120,
      field: 'status',
      headerName: 'Status',
      renderCell: params => {
        const status = statusObj[params.row.status]

        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            label={status.title}
            color={status.color}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      flex: 0.135,
      minWidth: 140,
      field: 'actions',
      headerName: 'Actions',
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

  function loadServerRows(currentPage, data) {
    return data.slice(currentPage * paginationModel.pageSize, (currentPage + 1) * paginationModel.pageSize)
  }

  const fetchTableData = useCallback(
    async (sort, q, column) => {
      await axios
        .get(routesConfig.getEntities, {
          params: {
            q,
            sort,
            column,
            entity: ENTITY
          }
        })
        .then(res => {
          setTotal(res.data.total)
          setRows(loadServerRows(paginationModel.page, res.data.data))
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel]
  )

  const fetchEntityDefs = async () => {
    await axios
      .get(routesConfig.getEntityDefs, {
        params: {
          entity: ENTITY
        }
      })
      .then(res => {
        console.log('contact Defs', res.data.data)
        setEntityDefs(res.data.data)
      })
  }

  useEffect(() => {
    fetchTableData(sort, searchValue, sortColumn)
  }, [fetchTableData, searchValue, sort, sortColumn])

  useEffect(() => {
    fetchEntityDefs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime Supabase
  useEffect(() => {
    const channel = supabase
      .channel('realtime clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacto' }, payload => {
        console.log('SUPABASE CHANGED', payload)
        fetchTableData(sort, searchValue, sortColumn)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTableData, searchValue, sort, sortColumn])

  const handleSortModel = newModel => {
    if (newModel.length) {
      setSort(newModel[0].sort)
      setSortColumn(newModel[0].field)
      fetchTableData(newModel[0].sort, searchValue, newModel[0].field)
    } else {
      setSort('asc')
      setSortColumn('full_name')
    }
  }

  const handleSearch = value => {
    setSearchValue(value)
    fetchTableData(sort, value, sortColumn)
  }

  // Once we get the defs, we set the required fields
  useEffect(() => {
    if (entityDefs?.fields) {
      const requiredFields = Object.entries(entityDefs?.fields).filter(([key, value]) => value.required)
      setRequiredFields(requiredFields)
    }
  }, [entityDefs])

  return (
    <>
      <Card>
        <Typography variant='h4' sx={{ p: 6 }}>
          Contactos
        </Typography>
        <DataGrid
          autoHeight
          pagination
          rows={rows}
          rowCount={total}
          columns={columns}
          loading={rows.length === 0}
          onRowClick={e => setSelectedRow(e.row)}
          onRowDoubleClick={e => {
            setModalMode('View')
            setSelectedRow(e.row)
            handleOpen()
          }}
          checkboxSelection={showCheckboxSelection}
          onRowSelectionModelChange={ids => {
            const selectedIDs = new Set(ids)
            const selectedRowData = rows.filter(row => selectedIDs.has(row.id))
            console.log('selectedRowsData', selectedRowData)
          }}
          sortingMode='server'
          paginationMode='server'
          pageSizeOptions={[7, 10, 25, 50]}
          paginationModel={paginationModel}
          onSortModelChange={handleSortModel}
          slots={{ toolbar: ServerSideToolbar }}
          onPaginationModelChange={setPaginationModel}
          localeText={{
            toolbarColumns: 'Columnas',
            toolbarFilters: 'Filtrar',
            toolbarDensity: 'Densidad',
            toolbarExport: 'Exportar'
          }}
          slotProps={{
            baseButton: {
              size: 'medium',
              variant: 'tonal'
            },
            toolbar: {
              value: searchValue,
              showCheckboxSelection,
              setShowCheckboxSelection,
              handleOpen,
              setModalMode,
              setSelectedRow,
              clearSearch: () => handleSearch(''),
              onChange: event => handleSearch(event.target.value)
            }
          }}
        />
      </Card>
      {/* <TransitionsModal
        open={open}
        handleClose={handleClose}
        entity={ENTITY}
        mode={modalMode}
        setModalMode={setModalMode}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        entityDefs={entityDefs}
        rows={rows}
        setRows={setRows}
      /> */}
      <DatePickerWrapper>
        <MUIModal
          currentRow={selectedRow}
          show={open}
          setShow={setOpen}
          entity={ENTITY}
          mode={modalMode}
          setMode={setModalMode}
          entityDefs={entityDefs}
        />
      </DatePickerWrapper>
    </>
  )
}

TableServerSide.acl = {
  action: 'read',
  subject: 'clients'
}

export default TableServerSide
