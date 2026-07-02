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
      const result = await query('SELECT * FROM debts ORDER BY date DESC')
      res.status(200).json(result.rows)
    } else if (req.method === 'POST') {
      const { person, amount, description, type, status, due_date, date, total_amount, installment_count, installment_amount, tenor_type } = req.body
      const ta = total_amount || amount
      const ic = installment_count || 1
      const ia = installment_amount || (ic > 0 ? Number(ta) / ic : null)
      const result = await query(
        `INSERT INTO debts (person, amount, description, type, status, due_date, date, total_amount, installment_count, installment_amount, tenor_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [person, amount || ta, description || '', type || 'taken', status || 'pending', due_date || null, date || new Date().toISOString().split('T')[0], ta, ic, ia, tenor_type || 'monthly']
      )
      res.status(201).json(result.rows[0])
    } else if (req.method === 'PUT') {
      const { id, person, amount, description, type, status, due_date, date, total_amount, installment_count, installment_amount, tenor_type } = req.body
      // Build SET dynamically to only update provided fields
      const fields = []
      const values = []
      let idx = 1
      if (person !== undefined) { fields.push(`person = $${idx++}`); values.push(person) }
      if (amount !== undefined) { fields.push(`amount = $${idx++}`); values.push(amount) }
      if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description) }
      if (type !== undefined) { fields.push(`type = $${idx++}`); values.push(type) }
      if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status) }
      if (due_date !== undefined) { fields.push(`due_date = $${idx++}`); values.push(due_date) }
      if (date !== undefined) { fields.push(`date = $${idx++}`); values.push(date) }
      if (total_amount !== undefined) { fields.push(`total_amount = $${idx++}`); values.push(total_amount) }
      if (installment_count !== undefined) { fields.push(`installment_count = $${idx++}`); values.push(installment_count) }
      if (installment_amount !== undefined) { fields.push(`installment_amount = $${idx++}`); values.push(installment_amount) }
      if (tenor_type !== undefined) { fields.push(`tenor_type = $${idx++}`); values.push(tenor_type) }
      fields.push(`updated_at = NOW()`)
      values.push(id)
      const result = await query(
        `UPDATE debts SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      )
      res.status(200).json(result.rows[0])
    } else if (req.method === 'DELETE') {
      const { id } = req.body
      await query('DELETE FROM debts WHERE id = $1', [id])
      res.status(204).end()
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
