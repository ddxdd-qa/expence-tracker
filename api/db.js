import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function query(text, params) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    return res
  } catch (error) {
    throw error
  }
}

export async function getClient() {
  return pool.connect()
}
