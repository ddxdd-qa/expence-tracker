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
      const result = await query('SELECT * FROM transactions ORDER BY date DESC')
      res.status(200).json(result.rows)
    } else if (req.method === 'POST') {
      const { location_id, category_id, amount, description, date, account_id, type } = req.body
      if (amount < 0) {
        res.status(400).json({ error: 'Amount cannot be negative' })
        return
      }
      const txType = type === 'income' ? 'income' : 'expense'
      const result = await query(
        'INSERT INTO transactions (location_id, category_id, amount, description, date, account_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [location_id, category_id, amount, description, date, account_id || null, txType]
      )
      res.status(201).json(result.rows[0])
    } else if (req.method === 'PUT') {
      const { id, location_id, category_id, amount, description, date, account_id, type } = req.body
      if (amount < 0) {
        res.status(400).json({ error: 'Amount cannot be negative' })
        return
      }
      const txType = type === 'income' ? 'income' : 'expense'
      const result = await query(
        'UPDATE transactions SET location_id = $1, category_id = $2, amount = $3, description = $4, date = $5, account_id = $6, type = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
        [location_id, category_id, amount, description, date, account_id || null, txType, id]
      )
      res.status(200).json(result.rows[0])
    } else if (req.method === 'DELETE') {
      const { id } = req.body
      await query('DELETE FROM transactions WHERE id = $1', [id])
      res.status(204).end()
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
