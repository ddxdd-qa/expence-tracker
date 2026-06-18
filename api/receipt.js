import { createWorker } from 'tesseract.js'
import sharp from 'sharp'

let worker = null

async function initWorker() {
  if (!worker) {
    worker = await createWorker('eng')
  }
  return worker
}

function parseReceiptText(text) {
  const lines = text.split('\n').filter(line => line.trim())
  const items = []
  
  for (const line of lines) {
    const match = line.match(/(.+?)\s+(\d+\.?\d*)\s*$/)
    if (match) {
      const description = match[1].trim()
      const amount = parseFloat(match[2])
      
      if (amount > 0 && description.length > 2) {
        items.push({
          description,
          amount,
          category_id: null,
          location_id: null
        })
      }
    }
  }
  
  return items
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { imageBuffer } = req.body
    
    if (!imageBuffer) {
      res.status(400).json({ error: 'No image provided' })
      return
    }

    const buffer = Buffer.from(imageBuffer, 'base64')
    
    const optimized = await sharp(buffer)
      .resize(1500, 2000, { fit: 'inside', withoutEnlargement: true })
      .grayscale()
      .toBuffer()

    const ocr = await initWorker()
    const { data: { text } } = await ocr.recognize(optimized)
    
    const items = parseReceiptText(text)

    res.status(200).json({
      items,
      rawText: text
    })
  } catch (error) {
    console.error('Receipt processing error:', error)
    res.status(500).json({ error: error.message })
  }
}
