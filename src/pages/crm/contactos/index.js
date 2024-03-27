/* eslint-disable lines-around-comment */
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
import ServerSideToolbar from 'src/views/table/data-grid/ServerSideToolbarContactos'
import CustomFooter from 'src/views/table/data-grid/CustomFooter'

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
import MUIModal from 'src/@core/components/modified-components/dialog'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Columns Import
import { getColumns } from 'src/constants/ContactosCols'

const ENTITY = 'contacto'

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
  const [modalMode, setModalMode] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState([])

  const handleOpen = () => {
    setOpen(true)
  }

  const columns = getColumns(setModalMode, handleOpen)

  function loadServerRows(currentPage, data) {
    return data.slice(currentPage * paginationModel.pageSize, (currentPage + 1) * paginationModel.pageSize)
  }

  const fetchTableData = useCallback(
    async (sort, q, column) => {
      setLoading(true)
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
          setLoading(false)
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel]
  )

  const deleteSelection = async () => {
    const ids = selectedRows.map(row => row.id)

    // Ask the user if they are sure they want to delete the selected rows
    const confirm = window.confirm(`¿Estas seguro que quieres borrar ${ids.length} registros?`)

    if (!confirm) return

    await axios
      .post(routesConfig.deleteEntities, {
        params: {
          entity: ENTITY,
          ids
        }
      })
      .then(res => {
        console.log('deleted', res)
        fetchTableData(sort, searchValue, sortColumn)
      })
  }

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

  return (
    <>
      <Card>
        <Typography variant='h4' sx={{ p: 6 }}>
          Contactos
        </Typography>
        <DataGrid
          autoHeight
          pagination
          sx={{ overflowX: 'scroll' }}
          rows={rows}
          rowCount={total}
          columns={columns}
          loading={loading}
          onRowClick={e => setSelectedRow(e.row)}
          onRowDoubleClick={e => {
            setModalMode('Edit')
            setSelectedRow(e.row)
            handleOpen()
          }}
          checkboxSelection={showCheckboxSelection}
          onRowSelectionModelChange={ids => {
            const selectedIDs = new Set(ids)
            const selectedRowData = rows.filter(row => selectedIDs.has(row.id))
            console.log('selectedRowsData', selectedRowData)
            setSelectedRows(selectedRowData)
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                // Hide columns status and traderName, the other columns will remain visible
                email: false
                // cuentas: false,
                // acuerdos: false,
                // telefono: false
              }
            }
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
        {/* if there are selected rows, show the actions */}
        {selectedRows.length > 0 && (
          <CardActions
            sx={{
              backgroundColor: 'background.default',
              justifyContent: 'flex-start',
              padding: 3,
              display: 'flex',
              justifyItems: 'center'
            }}
          >
            <Button
              size='medium'
              variant='tonal'
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={deleteSelection}
            >
              <Icon icon='tabler:trash' />
              Borrar Selección
            </Button>
          </CardActions>
        )}
      </Card>
      <MUIModal
        currentRow={selectedRow}
        show={open}
        setShow={setOpen}
        entity={ENTITY}
        mode={modalMode}
        setMode={setModalMode}
        entityDefs={entityDefs}
      />
    </>
  )
}

TableServerSide.acl = {
  action: 'read',
  subject: 'crm'
}

export default TableServerSide
