const statusObj = {
  Baja: { title: 'Activo', color: 'success' },
  Alta: { title: 'Perdido', color: 'error' },
  Media: { title: 'Lead', color: 'warning' }
}

export const tipoObj = {
  Cliente: { title: 'Cliente', color: 'mainType' },
  Proveedor: { title: 'Proveedor', color: 'secondaryType' }
}

export const leadObj = {
  'Intento de contacto': { title: 'Intento de contacto', color: 'warning' },
  Contactado: { title: 'Contactado', color: 'success' },
  Calificado: { title: 'Calificado', color: 'success' },
  'No Calificado': { title: 'No Calificado', color: 'error' },
  'Lead Nuevo': { title: 'Lead Nuevo', color: 'warning' }
}

export default statusObj
