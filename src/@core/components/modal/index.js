import * as React from 'react'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import { Button, Grid, Input, Modal } from '@mui/material'
import Item from '../item'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { useState } from 'react'
import supabase from 'src/@core/utils/supabase'
import FileUploaderMultiple from 'src/views/forms/form-elements/file-uploader/FileUploaderMultiple'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 6,
  display: 'flex',
  flexDirection: 'column',
  minWidth: '80%'
}

const renderClientBigger = params => {
  const { row } = params

  const stateNum = row.status - 1
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color = states[stateNum]
  if (row.avatar?.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '4rem', height: '4rem' }} />
  } else {
    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '1.5rem', width: '4rem', height: '4rem' }}>
        {getInitials(row.full_name ? row.full_name : 'John Doe')}
      </CustomAvatar>
    )
  }
}

export default function TransitionsModal({
  open,
  handleClose,
  entity,
  mode,
  setModalMode,
  selectedRow,
  setSelectedRow,
  entityDefs,
  rows,
  setRows
}) {
  const [newEntity, setNewEntity] = useState({})
  const tempEntity = { ...selectedRow }
  const [formErrors, setFormErrors] = useState({})
  const ENTITY = entity.toLowerCase()
  const [requiredFields, setRequiredFields] = useState([])

  const onClean = (cleanSelectedRow = true) => {
    console.log('Cleaning')

    // We cancel the changes and set the rows to the tempEntity

    setSelectedRow(tempEntity)

    if (selectedRow) {
      setRows(
        rows.map(row => {
          if (row.id === selectedRow.id) {
            console.log('FOUND ROW TO CLEAN')

            return tempEntity
          }

          return row
        })
      )
    }

    // Show a toast telling the user that the changes were canceled
    if (cleanSelectedRow) {
      toast('Cambios cancelados', {
        icon: '⚠️'
      })
    }
  }

  useEffect(() => {
    if (entityDefs?.fields) {
      const requiredFields = Object.entries(entityDefs?.fields).filter(([key, value]) => value.required)
      setRequiredFields(requiredFields)
    }
  }, [entityDefs])

  const validateForm = data => {
    let willSend = true
    let errors = {}

    // The required fields cant be empty, if they are, we show a toast and return
    for (let i = 0; i < requiredFields.length; i++) {
      if (!data[requiredFields[i][0]]) {
        willSend = false
        errors[requiredFields[i][0]] = `El campo ${requiredFields[i][1].label} es requerido`
      }
    }

    setFormErrors(errors)

    // If there are errors, we clean the formErrors and return
    if (!willSend && mode === 'Edit') {
      console.log('Errors found', formErrors)
      onClean(false)
    }

    return willSend
  }

  const onSave = async data => {
    console.log('dataUpsert', data)

    // We validate the form
    if (!validateForm(data)) {
      // If there are errors, we set the modal mode to view and then to edit, so the user can see the errors
      if (mode === 'Edit') {
        setModalMode('View')
        setTimeout(() => {
          setModalMode('Edit')
        })
      }

      return
    }

    // If there are no errors, we continue
    handleClose()

    const { data: user, error } = await supabase.from(ENTITY).upsert(data).select()

    // Show a promise toast with the result
    toast.promise(
      new Promise((resolve, reject) => {
        if (error) {
          reject(error)
        } else {
          resolve(user)
        }
      }),
      {
        loading: 'Guardando...',
        success: 'Contacto guardado',
        error: 'Error al guardar'
      }
    )

    setNewEntity({})

    return { user, error }
  }

  const onDelete = async data => {
    console.log('dataDelete', data)

    handleClose()

    const { data: user, error } = await supabase.from(ENTITY).delete().eq('id', data.id).select()

    // Show a promise toast with the result
    toast.promise(
      new Promise((resolve, reject) => {
        if (error) {
          reject(error)
        } else {
          resolve(user)
        }
      }),
      {
        loading: 'Eliminando...',
        success: 'Contacto eliminado',
        error: 'Error al eliminar'
      }
    )

    return { user, error }
  }

  return (
    <div>
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        open={open}
        onClose={() => {
          handleClose()
          setFormErrors({})
        }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500
          }
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={open}>
          <Box sx={style}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedRow && (mode == 'View' || mode == 'Edit' || mode == 'Delete') ? (
                  <>
                    {renderClientBigger({ row: selectedRow })}
                    <Typography variant='h3'>{selectedRow?.full_name}</Typography>
                    <Button
                      size='small'
                      color='secondary'
                      onClick={() => {
                        if (mode === 'Edit') {
                          // If the selected row is different from the tempEntity, it means that the user has made changes but he has not saved them
                          if (selectedRow !== tempEntity) {
                            // We cancel the changes and set the rows to the tempEntity
                            onClean()
                          }
                          setFormErrors({})
                          setModalMode('View')
                        } else {
                          setModalMode('Edit')
                        }
                      }}
                    >
                      <Icon icon={'tabler:edit'} fontSize='25px' />
                    </Button>
                    <Typography
                      variant='body2'
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 1,
                        padding: 1,
                        display: mode === 'Edit' ? 'flex' : 'none'
                      }}
                    >
                      {mode === 'Edit' ? 'Editando' : ''}
                    </Typography>
                  </>
                ) : mode === 'New' ? (
                  <>
                    <Typography variant='h3' sx={{ textTransform: 'capitalize' }}>
                      {entity}
                    </Typography>
                  </>
                ) : mode === 'Import' ? (
                  <>
                    <Typography variant='h3'>Importar desde CSV</Typography>
                  </>
                ) : (
                  <></>
                )}
              </Box>

              <Button
                onClick={() => {
                  if (mode === 'Edit') {
                    // If the selected row is different from the tempEntity, it means that the user has made changes but he has not saved them
                    if (selectedRow !== tempEntity) {
                      onClean()
                    }
                  }
                  handleClose()
                  setFormErrors({})
                }}
              >
                <Icon icon='tabler:x' fontSize='25px' />
              </Button>
            </Box>

            {/* Body */}
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              {(mode === 'View' || mode === 'Edit') &&
                selectedRow &&
                Object.entries(selectedRow).map(([key, value]) => (
                  <Grid item xs={4} key={key}>
                    <Item sx={formErrors[key] ? { border: '1px solid red' } : {}}>
                      <Typography
                        variant='h6'
                        marginBottom={1.5}
                        sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                      >
                        {entityDefs?.fields[key].label ? entityDefs?.fields[key].label : key}
                        {/* If it is required, we add a red asterisk */}
                        {entityDefs?.fields[key].required ? <span style={{ color: 'red', marginLeft: 5 }}>*</span> : ''}
                      </Typography>
                      {mode === 'Edit' ? (
                        <Input
                          fullWidth
                          type={
                            entityDefs?.fields[key].type === 'number'
                              ? 'number'
                              : entityDefs?.fields[key].type === 'date'
                              ? 'date'
                              : entityDefs?.fields[key].type === 'file'
                              ? 'file'
                              : 'text'
                          }
                          defaultValue={value}
                          onChange={e => (selectedRow[key] = e.target.value)}
                        />
                      ) : (
                        <Typography variant='body1'>{value ? value : '-'}</Typography>
                      )}
                    </Item>
                  </Grid>
                ))}

              {mode === 'New' &&
                entityDefs?.fields &&
                Object.entries(entityDefs?.fields).map(([key, value]) => (
                  <Grid item xs={4} key={key}>
                    <Item sx={formErrors[key] ? { border: '1px solid red' } : {}}>
                      <Typography
                        variant='h6'
                        marginBottom={1.5}
                        sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                      >
                        {value.label ? value.label : key}
                        {value.required ? <span style={{ color: 'red', marginLeft: 5 }}>*</span> : ''}
                      </Typography>
                      <Input
                        fullWidth
                        type={
                          entityDefs?.fields[key].type === 'number'
                            ? 'number'
                            : entityDefs?.fields[key].type === 'date'
                            ? 'date'
                            : entityDefs?.fields[key].type === 'file'
                            ? 'file'
                            : 'text'
                        }
                        defaultValue={newEntity[key] ? newEntity[key] : ''}
                        onChange={e => {
                          newEntity[key] = e.target.value
                        }}
                      />
                    </Item>
                  </Grid>
                ))}

              {mode === 'Delete' && (
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Typography variant='h4' marginBottom={1.5} sx={{ fontWeight: 'bold' }}>
                    ¿Estás seguro de que quieres eliminar este contacto?
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={() => {
                        handleClose()
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant='contained'
                      color='error'
                      onClick={() => {
                        onDelete(selectedRow)
                      }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Grid>
              )}

              {mode === 'Import' && (
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <FileUploaderMultiple />
                </Grid>
              )}
            </Grid>

            {/* Error List */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 7 }}>
              {Object.entries(formErrors).map(([key, value]) => (
                <Grid item xs={4} key={key}>
                  <Item sx={{ bgcolor: 'error.main' }}>
                    <Typography variant='body1' color='error.contrastText' sx={{ fontWeight: 'bold' }}>
                      {value}
                    </Typography>
                  </Item>
                </Grid>
              ))}
            </Box>

            {/* Save Button */}
            <Button
              variant='contained'
              color='primary'
              sx={{ marginTop: 4, alignSelf: 'flex-end' }}
              style={{ display: mode === 'Edit' ? 'flex' : mode === 'New' ? 'flex' : 'none' }}
              onClick={() => {
                setFormErrors({})

                // Save the changes
                if (mode === 'Edit') {
                  onSave(selectedRow)
                } else if (mode === 'New') {
                  onSave(newEntity)

                  // setNewEntity({})
                }
              }}
            >
              <p
                style={{
                  padding: 0,
                  margin: 0,
                  marginRight: 5
                }}
              >
                Guardar
              </p>
              <Icon icon='tabler:device-floppy' fontSize='20px' />
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  )
}
