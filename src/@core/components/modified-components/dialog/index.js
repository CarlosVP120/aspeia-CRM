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

const statusObj = {
  ACTIVO: { title: 'Activo', color: 'success' },
  PERDIDO: { title: 'Perdido', color: 'error' },
  LEAD: { title: 'Lead', color: 'warning' }
}

const renderClientBigger = params => {
  const { row } = params

  const color = statusObj[row.status].color

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

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
})

const DialogEditUserInfo = ({ show, setShow, entity, entityDefs, mode, currentRow }) => {
  // Convert entityDefs.fields into an array of objects, where each key is the field name
  const entityFields = entityDefs?.fields
    ? Object.keys(entityDefs.fields).map(key => ({ name: key, ...entityDefs.fields[key] }))
    : []

  // Convert currentRow into an array of objects, where each key is the field name
  const [currentRowFields, setCurrentRowFields] = useState(
    currentRow ? Object.keys({ ...currentRow }).map(key => ({ name: key, value: currentRow[key] })) : []
  )

  useEffect(() => {
    setCurrentRowFields(
      currentRow ? Object.keys({ ...currentRow }).map(key => ({ name: key, value: currentRow[key] })) : []
    )
  }, [currentRow])

  // ** States
  const [languages, setLanguages] = useState([])

  const [newEntity, setNewEntity] = useState({})

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

  // Print the handleSubmit values

  const handleClickShowPassword = () => {
    setState({ ...state, showPassword: !state.showPassword })
  }

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
        success: 'Contacto eliminado',
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
                currentRow ? Object.keys({ ...currentRow }).map(key => ({ name: key, value: currentRow[key] })) : []
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
            {mode === 'New' ? entity : mode === 'Import' ? 'Importar' : currentRow?.full_name}
          </Typography>
          {/* <Typography sx={{ color: 'text.secondary' }}>Updating user details will receive a privacy audit.</Typography> */}
        </Box>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={5}>
              {mode === 'New' ? (
                entityFields.map((field, index) => {
                  console.log('field', field)

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
                                value: value,
                                onChange: e => onChange(e)
                              }}
                              id='validation-basic-select'
                              error={Boolean(errors.select)}
                              aria-describedby='validation-basic-select'
                              {...(errors.select && { helperText: 'This field is required' })}
                            >
                              {field.options.map((option, index) => (
                                <MenuItem key={index} value={option}>
                                  {option}
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
                        required: entityFields.find(f => f.name === field.name).required && !field.value
                      }}
                      render={({ field: { value, onChange } }) =>
                        entityFields.find(f => f.name === field.name).options ? (
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
                              console.log('currentRowData Updated', currentRowFields)
                            }}
                            id='validation-basic-select'
                            error={Boolean(errors.select)}
                            aria-describedby='validation-basic-select'
                            {...(errors.select && { helperText: 'This field is required' })}
                          >
                            {entityFields
                              .find(f => f.name === field.name)
                              .options.map((option, index) => (
                                <MenuItem key={index} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                          </CustomTextField>
                        ) : (
                          <CustomTextField
                            disabled={mode === 'View'}
                            fullWidth
                            type={entityFields.find(f => f.name === field.name).type}
                            value={field.value}
                            label={entityFields.find(f => f.name === field.name).label}
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

              {/* <Grid item xs={12} sm={6}>
                <Controller
                  name='firstName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='First Name'
                      onChange={onChange}
                      placeholder='Leonard'
                      error={Boolean(errors.firstName)}
                      aria-describedby='validation-basic-first-name'
                      {...(errors.firstName && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='lastName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Last Name'
                      onChange={onChange}
                      placeholder='Carter'
                      error={Boolean(errors.lastName)}
                      aria-describedby='validation-basic-last-name'
                      {...(errors.lastName && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      type='email'
                      value={value}
                      label='Email'
                      onChange={onChange}
                      error={Boolean(errors.email)}
                      placeholder='carterleonard@gmail.com'
                      aria-describedby='validation-basic-email'
                      {...(errors.email && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Password'
                      onChange={onChange}
                      id='validation-basic-password'
                      error={Boolean(errors.password)}
                      type={state.showPassword ? 'text' : 'password'}
                      {...(errors.password && { helperText: 'This field is required' })}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              <Icon fontSize='1.25rem' icon={state.showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='dob'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      selected={value}
                      showYearDropdown
                      showMonthDropdown
                      onChange={e => onChange(e)}
                      placeholderText='MM/DD/YYYY'
                      customInput={
                        <CustomInput
                          value={value}
                          onChange={onChange}
                          label='Date of Birth'
                          error={Boolean(errors.dob)}
                          aria-describedby='validation-basic-dob'
                          {...(errors.dob && { helperText: 'This field is required' })}
                        />
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='select'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      select
                      fullWidth
                      defaultValue=''
                      label='Country'
                      SelectProps={{
                        value: value,
                        onChange: e => onChange(e)
                      }}
                      id='validation-basic-select'
                      error={Boolean(errors.select)}
                      aria-describedby='validation-basic-select'
                      {...(errors.select && { helperText: 'This field is required' })}
                    >
                      <MenuItem value='UK'>UK</MenuItem>
                      <MenuItem value='USA'>USA</MenuItem>
                      <MenuItem value='Australia'>Australia</MenuItem>
                      <MenuItem value='Germany'>Germany</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='textarea'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      rows={4}
                      fullWidth
                      multiline
                      {...field}
                      label='Bio'
                      error={Boolean(errors.textarea)}
                      aria-describedby='validation-basic-textarea'
                      {...(errors.textarea && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl error={Boolean(errors.radio)}>
                  <FormLabel>Gender</FormLabel>
                  <Controller
                    name='radio'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <RadioGroup row {...field} aria-label='gender' name='validation-basic-radio'>
                        <FormControlLabel
                          value='female'
                          label='Female'
                          sx={errors.radio ? { color: 'error.main' } : null}
                          control={<Radio sx={errors.radio ? { color: 'error.main' } : null} />}
                        />
                        <FormControlLabel
                          value='male'
                          label='Male'
                          sx={errors.radio ? { color: 'error.main' } : null}
                          control={<Radio sx={errors.radio ? { color: 'error.main' } : null} />}
                        />
                        <FormControlLabel
                          value='other'
                          label='Other'
                          sx={errors.radio ? { color: 'error.main' } : null}
                          control={<Radio sx={errors.radio ? { color: 'error.main' } : null} />}
                        />
                      </RadioGroup>
                    )}
                  />
                  {errors.radio && (
                    <FormHelperText
                      id='validation-basic-radio'
                      sx={{ mx: 0, color: 'error.main', fontSize: theme => theme.typography.body2.fontSize }}
                    >
                      This field is required
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
                <FormControl>
                  <Controller
                    name='checkbox'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <FormControlLabel
                        label='Agree to our terms and conditions'
                        sx={errors.checkbox ? { color: 'error.main' } : null}
                        control={
                          <Checkbox
                            {...field}
                            name='validation-basic-checkbox'
                            sx={errors.checkbox ? { color: 'error.main' } : null}
                          />
                        }
                      />
                    )}
                  />
                  {errors.checkbox && (
                    <FormHelperText
                      id='validation-basic-checkbox'
                      sx={{ mx: 0, color: 'error.main', fontSize: theme => theme.typography.body2.fontSize }}
                    >
                      This field is required
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid> */}

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
