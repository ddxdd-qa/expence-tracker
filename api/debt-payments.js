import { query, getClient } from './db.js'

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
      const { debt_id } = req.query
      if (!debt_id) return res.status(400).json({ error: 'debt_id query param required' })
      const result = await query(
        `SELECT dp.*, a.name as account_name
         FROM debt_payments dp
         LEFT JOIN accounts a ON dp.account_id = a.id
         WHERE dp.debt_id = $1
         ORDER BY dp.date DESC`,
        [debt_id]
      )
      return res.status(200).json(result.rows)
    }

    if (req.method === 'POST') {
      const { debt_id, amount, date, notes, account_id } = req.body

      // Get debt info for transaction type & person
      const debtRes = await query('SELECT person, type FROM debts WHERE id = $1', [debt_id])
      if (!debtRes.rows.length) return res.status(404).json({ error: 'Debt not found' })
      const debt = debtRes.rows[0]

      const txType = debt.type === 'taken' ? 'expense' : 'income'
      const txDesc = debt.type === 'taken'
        ? `Bayar hutang ke ${debt.person}`
        : `Terima piutang dari ${debt.person}`
      const payDate = date || new Date().toISOString().split('T')[0]

      // Look up system category
      const sysKey = debt.type === 'taken' ? 'debt_payment' : 'debt_collection'
      const catRes = await query('SELECT id FROM categories WHERE system_key = $1 LIMIT 1', [sysKey])
      const categoryId = catRes.rows.length > 0 ? catRes.rows[0].id : null

      const client = await getClient()
      try {
        await client.query('BEGIN')

        // Insert payment
        const payRes = await client.query(
          `INSERT INTO debt_payments (debt_id, amount, date, notes, account_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [debt_id, amount, payDate, notes || '', account_id || null]
        )

        // Create linked transaction if wallet selected
        let txId = null
        if (account_id) {
          const txRes = await client.query(
            `INSERT INTO transactions (type, amount, account_id, category_id, description, date)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [txType, amount, account_id, categoryId, txDesc, payDate]
          )
          txId = txRes.rows[0].id
          await client.query(
            'UPDATE debt_payments SET transaction_id = $1 WHERE id = $2',
            [txId, payRes.rows[0].id]
          )
        }

        // Update remaining debt amount
        await client.query(
          'UPDATE debts SET amount = amount - $1, updated_at = NOW() WHERE id = $2',
          [amount, debt_id]
        )

        await client.query('COMMIT')

        const payment = payRes.rows[0]
        payment.transaction_id = txId
        return res.status(201).json(payment)
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body
      // Clear FK reference first, then delete transaction, update debt, delete payment
      const payRes = await query(
        'SELECT debt_id, amount, transaction_id FROM debt_payments WHERE id = $1',
        [id]
      )
      if (payRes.rows.length > 0) {
        const pay = payRes.rows[0]
        await query('UPDATE debt_payments SET transaction_id = NULL WHERE id = $1', [id])
        if (pay.transaction_id) {
          await query('DELETE FROM transactions WHERE id = $1', [pay.transaction_id])
        }
        await query(
          'UPDATE debts SET amount = amount + $1, updated_at = NOW() WHERE id = $2',
          [pay.amount, pay.debt_id]
        )
      }
      await query('DELETE FROM debt_payments WHERE id = $1', [id])
      return res.status(204).end()
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
