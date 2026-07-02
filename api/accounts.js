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
      const result = await query('SELECT * FROM accounts ORDER BY name')
      res.status(200).json(result.rows)
    } else if (req.method === 'POST') {
      const { name, type, balance } = req.body
      const result = await query(
        'INSERT INTO accounts (name, type, balance) VALUES ($1, $2, $3) RETURNING *',
        [name, type, balance || 0]
      )
      res.status(201).json(result.rows[0])
    } else if (req.method === 'PUT') {
      const { id, name, type, balance } = req.body
      const result = await query(
        'UPDATE accounts SET name = $1, type = $2, balance = $3 WHERE id = $4 RETURNING *',
        [name, type, balance, id]
      )
      res.status(200).json(result.rows[0])
    } else if (req.method === 'DELETE') {
      const { id } = req.body
      await query('DELETE FROM accounts WHERE id = $1', [id])
      res.status(204).end()
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
