import { query } from './db.js'

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
      const result = await query('SELECT * FROM items ORDER BY date DESC')
      res.status(200).json(result.rows)
    } else if (req.method === 'POST') {
      const { name, location_id, date, qty, unit, price } = req.body
      if (!name || !date || price == null) {
        res.status(400).json({ error: 'name, date, and price are required' })
        return
      }
      const result = await query(
        'INSERT INTO items (name, location_id, date, qty, unit, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, location_id || null, date, qty || 1, unit || 'pcs', price]
      )
      res.status(201).json(result.rows[0])
    } else if (req.method === 'PUT') {
      const { id, name, location_id, date, qty, unit, price } = req.body
      const result = await query(
        'UPDATE items SET name = $1, location_id = $2, date = $3, qty = $4, unit = $5, price = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
        [name, location_id || null, date, qty || 1, unit || 'pcs', price, id]
      )
      res.status(200).json(result.rows[0])
    } else if (req.method === 'DELETE') {
      const { id } = req.body
      await query('DELETE FROM items WHERE id = $1', [id])
      res.status(204).end()
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
