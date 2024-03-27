// ** React Imports
// ** React Imports
import { forwardRef, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Box, Dialog, DialogContent, Fade, MenuItem, Typography } from '@mui/material'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import supabase from 'src/@core/utils/supabase'
import FileUploaderMultiple from 'src/views/forms/form-elements/file-uploader/FileUploaderMultiple'
import statusObj, { leadObj } from 'src/constants/SelectColores'
import axios from 'axios'
import routesConfig from 'src/configs/routes'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const CustomCloseButton = styled(IconButton)(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const renderClientBigger = params => {
  const { row } = params

  const color = statusObj[row.prioridad]?.color || leadObj[row.estado]?.color || 'success'

  if (row.avatar?.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '4rem', height: '4rem' }} />
  } else {
    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '1.5rem', width: '4rem', height: '4rem' }}>
        {getInitials(row.nombre ? row.nombre : 'John Doe')}
      </CustomAvatar>
    )
  }
}

const DialogEditUserInfo = ({ show, setShow, entity, entityDefs, mode, currentRow }) => {
  // Convert entityDefs.fields into an array of objects, where each key is the field name
  const [entityFields, setEntityFields] = useState([])

  // Convert currentRow into an array of objects, excluding created_at and updated_at
  const [currentRowFields, setCurrentRowFields] = useState(
    currentRow
      ? Object.keys({ ...currentRow })
          .filter(key => key !== 'created_at' && key !== 'updated_at')
          .map(key => ({ name: key, value: currentRow[key] }))
      : []
  )

  useEffect(() => {
    setCurrentRowFields(
      currentRow
        ? Object.keys({ ...currentRow })
            .filter(key => key !== 'created_at' && key !== 'updated_at')
            .map(key => ({ name: key, value: currentRow[key] }))
        : []
    )
  }, [currentRow])

  const [state, setState] = useState({
    password: '',
    showPassword: false
  })

  // ** Default Values, map the entityFields to an object with the field name as the key and an empty string as the value
  const defaultValues = entityFields.reduce((acc, field) => {
    return { ...acc, [field.name]: '' }
  }, {})

  // ** Hooks
  const {
    control,
    handleSubmit,
    clearErrors,
    getValues,
    reset,
    formState: { errors }
  } = useForm({ defaultValues })

  console.log('errors', errors)

  useEffect(() => {
    if (entityDefs?.fields) {
      const updatedFields = Object.keys(entityDefs.fields).map(key => ({
        name: key,
        ...entityDefs.fields[key]
      }))
      setEntityFields(updatedFields)
    }
  }, [entityDefs])

  // Fetch and update options when entityFields changes
  useEffect(() => {
    if (entityFields.length > 0) {
      entityFields.forEach(async field => {
        if (field.oneOf) {
          try {
            const res = await axios.get(routesConfig.getEntities, {
              params: {
                entity: field.oneOf
              }
            })
            const updatedFields = [...entityFields]
            const fieldIndex = updatedFields.findIndex(f => f.name === field.name)
            updatedFields[fieldIndex].options = res.data.allData
            setEntityFields(updatedFields)
          } catch (error) {
            console.error('Error fetching entities:', error)
          }
        } else if (field.multipleOf) {
          try {
            const res = await axios.get(routesConfig.getEntities, {
              params: {
                entity: field.multipleOf
              }
            })
            const updatedFields = [...entityFields]
            const fieldIndex = updatedFields.findIndex(f => f.name === field.name)

            updatedFields[fieldIndex].options = res.data.allData
            setEntityFields(updatedFields)
          } catch (error) {
            console.error('Error fetching entities:', error)
          }
        }
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityFields.length]) // Only run when entityFields change

  console.log('entityFields', entityFields)

  const onSave = async data => {
    const { data: user, error } = await supabase.from(entity).upsert(data).select()

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

    return { user, error }
  }

  const onDelete = async id => {
    const { data: user, error } = await supabase.from(entity).delete().eq('id', id).select()

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
        success: 'Registro eliminado',
        error: 'Error al eliminar'
      }
    )
  }

  const onSubmit = () => {
    setShow(false)

    // Build an object where the key is the field name and the value is the field value, use the currentRowFields
    const formValues = currentRowFields.reduce((acc, field) => {
      return { ...acc, [field.name]: field.value }
    }, {})

    // Save the changes
    if (mode === 'Edit') {
      onSave(formValues)
    } else if (mode === 'New') {
      onSave(getValues())
      reset()
    }
  }

  const onUploadFromCSV = async parsedData => {
    setShow(false)

    try {
      const promises = parsedData.map(async client => {
        const { data, error } = await supabase.from(entity).upsert(client).select()

        if (error) {
          throw error
        } else {
          return data
        }
      })

      // Wait for all promises to resolve
      const results = await Promise.all(promises)

      // Show a single toast based on the results
      toast.promise(new Promise(resolve => resolve(results)), {
        loading: 'Guardando...',
        success: 'Contactos importados',
        error: 'Error al guardar algún contacto'
      })
    } catch (error) {
      toast.error('Error al realizar la operación')
    }
  }

  return (
    <Dialog
      fullWidth
      open={show}
      maxWidth='md'
      scroll='body'
      onClose={() => setShow(false)}
      TransitionComponent={Transition}
      onBackdropClick={() => setShow(false)}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogContent
        sx={{
          pb: theme => `${theme.spacing(8)} !important`,
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <CustomCloseButton
          onClick={() => {
            // Clear the form errors
            clearErrors()

            // if the row was being edited, toast a message
            if (mode === 'Edit') {
              toast('Los cambios no se guardaron')
            }

            // If the user closes the dialog, reset the row to the original values
            if (mode === 'New') {
            } else {
              setCurrentRowFields(
                currentRow
                  ? Object.keys({ ...currentRow })
                      .filter(key => key !== 'created_at' && key !== 'updated_at')
                      .map(key => ({ name: key, value: currentRow[key] }))
                  : []
              )
            }
            console.log('currentRowData Reset')
            setShow(false)
          }}
        >
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        <Box sx={{ mb: 3, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentRow && mode != 'New' && mode != 'Import' && renderClientBigger({ row: currentRow })}
          <Typography variant='h3' sx={{ textTransform: 'capitalize' }}>
            {mode === 'New' ? entity : mode === 'Import' ? 'Importar' : currentRow?.nombre}
          </Typography>
          {/* <Typography sx={{ color: 'text.secondary' }}>Updating user details will receive a privacy audit.</Typography> */}
        </Box>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={5}>
              {mode === 'New' ? (
                entityFields.map((field, index) => {
                  console.log('fieldNew', field)

                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Controller
                        name={field.name}
                        control={control}
                        rules={{ required: field.required }}
                        render={({ field: { value, onChange } }) =>
                          field.options ? (
                            <CustomTextField
                              select
                              fullWidth
                              defaultValue=''
                              label={field.label}
                              SelectProps={{
                                value: value || [],

                                // On change, if the field is  multipleOf,add the value to an array, else, just pass the value
                                onChange: !field.multipleOf
                                  ? e => onChange(e)
                                  : e => {
                                      // If the value is already in the array, remove it, else, add it, but first delete everything that is undefined
                                      const updatedValue = e.target.value.includes(undefined)
                                        ? e.target.value.filter(value => value !== undefined)
                                        : e.target.value.includes(value)
                                        ? e.target.value.filter(val => val !== value)
                                        : e.target.value

                                      console.log('updatedValue', updatedValue)

                                      // Add it to the array and update the state
                                      onChange(updatedValue)
                                    },
                                multiple: field.multipleOf ? true : false
                              }}
                              id='validation-basic-select'
                              error={Boolean(errors.select)}
                              aria-describedby='validation-basic-select'
                              {...(errors.select && { helperText: 'This field is required' })}
                            >
                              {field.options.map((option, index) => (
                                <MenuItem key={index} value={option.id || option.user_id || option}>
                                  {option.nombre || option.name || option}
                                </MenuItem>
                              ))}
                            </CustomTextField>
                          ) : (
                            <CustomTextField
                              fullWidth
                              type={field.type}
                              value={value}
                              label={field.label}
                              onChange={onChange}
                              placeholder={field.placeholder}
                              error={Boolean(errors[field.name])}
                              aria-describedby={`validation-basic-${field.name}`}
                              {...(errors[field.name] && { helperText: 'This field is required' })}
                            />
                          )
                        }
                      />
                    </Grid>
                  )
                })
              ) : mode != 'Delete' && mode != 'Import' ? (
                currentRowFields.map((field, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Controller
                      name={field.name}
                      control={control}
                      rules={{
                        required: entityFields.find(f => f.name === field.name)?.required && !field.value
                      }}
                      render={({ field: { value, onChange } }) =>
                        entityFields.find(f => f.name === field.name)?.options ? (
                          <CustomTextField
                            disabled={mode === 'View'}
                            select
                            fullWidth
                            defaultValue={field.value}
                            label={entityFields.find(f => f.name === field.name).label}
                            onChange={e => {
                              const updatedFields = [...currentRowFields]
                              updatedFields[index].value = e.target.value
                              setCurrentRowFields(updatedFields)
                              console.log('currentRowData Updated Field', currentRowFields)
                            }}
                            SelectProps={{
                              // Multiple select
                              value: field.value || [],
                              onChange: e => {
                                // Completely replace the value with the new one
                                const updatedFields = [...currentRowFields]
                                updatedFields[index].value = e.target.value
                                setCurrentRowFields(updatedFields)
                                console.log('currentRowData Updated', currentRowFields[index])
                              },
                              multiple: entityFields.find(f => f.name === field.name).multipleOf
                            }}
                            id='validation-basic-select'
                            error={Boolean(errors.select)}
                            aria-describedby='validation-basic-select'
                            {...(errors.select && { helperText: 'This field is required' })}
                          >
                            {entityFields
                              .find(f => f.name === field.name)
                              .options.map((option, index) => (
                                <MenuItem key={index} value={option.id || option.user_id || option}>
                                  {option.nombre || option.name || option}
                                </MenuItem>
                              ))}
                          </CustomTextField>
                        ) : (
                          <CustomTextField
                            disabled={mode === 'View' || field.name === 'id'}
                            fullWidth
                            type={entityFields.find(f => f.name === field.name)?.type}
                            value={field.value}
                            label={entityFields.find(f => f.name === field.name)?.label}
                            InputProps={{
                              defaultValue: field.value || '' // Set the defaultValue to handle initial values
                            }}
                            onChange={e => {
                              const updatedFields = [...currentRowFields]
                              updatedFields[index].value = e.target.value
                              setCurrentRowFields(updatedFields)
                              console.log('currentRowData Updated', currentRowFields)
                            }}
                            placeholder={field.placeholder}
                            error={Boolean(errors[field.name] && !value)}
                            aria-describedby={`validation-basic-${field.name}`}
                            {...(errors[field.name] && { helperText: 'Este campo es requerido' })}
                          />
                        )
                      }
                    />
                  </Grid>
                ))
              ) : mode === 'Import' ? (
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
                  <FileUploaderMultiple onUpload={onUploadFromCSV} />
                </Grid>
              ) : (
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
                  <Typography variant='h4' sx={{ textAlign: 'center' }}>
                    ¿Está seguro que desea eliminar este registro?
                  </Typography>
                  <Button
                    variant='contained'
                    color='error'
                    sx={{ display: 'flex', gap: 1 }}
                    onClick={() => {
                      setShow(false)
                      onDelete(currentRow.id)
                    }}
                  >
                    Eliminar
                    <Icon icon='tabler:trash' fontSize='20px' />
                  </Button>
                </Grid>
              )}

              <Grid
                item
                xs={12}
                sx={{
                  display: mode === 'View' || mode === 'Import' || mode === 'Delete' ? 'none' : 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <Button
                  type='submit'
                  variant='contained'
                  disabled={mode === 'View'}
                  sx={{ alignSelf: 'flex-end', display: 'flex', gap: 1 }}
                >
                  Guardar
                  <Icon icon='tabler:device-floppy' fontSize='20px' />
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}

export default DialogEditUserInfo
