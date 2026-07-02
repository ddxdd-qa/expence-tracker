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
      const result = await query('SELECT * FROM budgets ORDER BY period DESC')
      res.status(200).json(result.rows)
    } else if (req.method === 'POST') {
      const { category_id, amount, period } = req.body
      // Upsert budget on conflict
      const result = await query(
        `INSERT INTO budgets (category_id, amount, period) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (category_id, period) 
         DO UPDATE SET amount = EXCLUDED.amount 
         RETURNING *`,
        [category_id, amount, period]
      )
      res.status(201).json(result.rows[0])
    } else if (req.method === 'PUT') {
      const { id, category_id, amount, period } = req.body
      const result = await query(
        `UPDATE budgets SET category_id = $1, amount = $2, period = $3 WHERE id = $4 RETURNING *`,
        [category_id, amount, period, id]
      )
      res.status(200).json(result.rows[0])
    } else if (req.method === 'DELETE') {
      const { id } = req.body
      await query('DELETE FROM budgets WHERE id = $1', [id])
      res.status(204).end()
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
