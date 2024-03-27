// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Button } from '@mui/material'

const ServerSideToolbar = props => {
  // console.log('ServerSideToolbar -> props', props)

  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: theme => theme.spacing(2, 5, 4, 5)
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          size='medium'
          variant='contained'
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          sx={{ '&:hover': { bgcolor: 'primary.dark' } }}
          onClick={() => {
            props.setModalMode('New')
            props.setSelectedRow(null)
            props.handleOpen()
          }}
        >
          <Icon icon='tabler:circle-plus' />
          Agregar
        </Button>
        <Button
          size='medium'
          variant='tonal'
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => {
            props.setModalMode('Import')
            props.handleOpen()
          }}
        >
          <Icon icon='tabler:file-import' />
          Importar
        </Button>
        <GridToolbarExport printOptions={{ disableToolbarButton: true }} />

        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button
          size='medium'
          variant='tonal'
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => props.setShowCheckboxSelection(!props.showCheckboxSelection)}
        >
          <Icon icon='tabler:checkbox' />
          Seleccionar
        </Button>
      </Box>
      <CustomTextField
        value={props.value}
        placeholder='Search…'
        onChange={props.onChange}
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 2, display: 'flex' }}>
              <Icon fontSize='1.25rem' icon='tabler:search' />
            </Box>
          ),
          endAdornment: (
            <IconButton size='small' title='Clear' aria-label='Clear' onClick={props.clearSearch}>
              <Icon fontSize='1.25rem' icon='tabler:x' />
            </IconButton>
          )
        }}
        sx={{
          width: {
            xs: 1,
            sm: 'auto'
          },
          '& .MuiInputBase-root > svg': {
            mr: 2
          }
        }}
      />
    </Box>
  )
}

export default ServerSideToolbar
