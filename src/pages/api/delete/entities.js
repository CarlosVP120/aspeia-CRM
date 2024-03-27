import supabase from 'src/@core/utils/supabase'

export default async function handler(config, response) {
  if (config.method === 'POST') {
    console.log('GET REQUEST TO /api/delete/entities')
    const { entity = '', ids = [] } = config.body.params

    try {
      // Use Promise.all to wait for all delete operations to complete
      await Promise.all(
        ids.map(async id => {
          const { data, error } = await supabase.from(entity).delete().eq('id', id)

          if (error) {
            console.log('error deleting', error.message)
            throw new Error(error.message) // Stop execution if there's an error
          }
        })
      )

      console.log('SUPADATA DELETED>>>>>>', ids)
      response.status(200).end() // Send a response after all deletes are done
    } catch (error) {
      response.status(500).json({
        error: error.message
      })
    }
  }
}
