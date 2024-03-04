import supabase from 'src/@core/utils/supabase'

export default async function handler(config, response) {
  if (config.method === 'GET') {
    console.log('GET REQUEST TO /api/get/contact-defs')

    const { entity = '' } = config.query

    const { data, error } = await supabase.from('diccionario').select('*').eq('entity_name', entity)

    console.log('SUPADATA ENTITYDEFS>>>>>>', data.length)

    response.status(200).json({
      data: data[0]
    })
  }
}
