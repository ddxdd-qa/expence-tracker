import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      res.status(200).json(data)
    } else if (req.method === 'POST') {
      const { location_id, category_id, amount, description, date } = req.body

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ location_id, category_id, amount, description, date }])
        .select()

      if (error) throw error
      res.status(201).json(data[0])
    } else if (req.method === 'PUT') {
      const { id, location_id, category_id, amount, description, date } = req.body

      const { data, error } = await supabase
        .from('transactions')
        .update({ location_id, category_id, amount, description, date })
        .eq('id', id)
        .select()

      if (error) throw error
      res.status(200).json(data[0])
    } else if (req.method === 'DELETE') {
      const { id } = req.body

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      res.status(204).end()
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
