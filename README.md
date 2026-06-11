# Expense Tracker

A personal expense tracking web app built with Vue 3, Vite, and Supabase. Track your spending by location and category, with detailed monthly reports and price comparisons.

## Features

- ✅ Add, edit, and delete transactions
- ✅ Organize expenses by custom locations
- ✅ Categorize spending with custom colors
- ✅ Monthly spending dashboard with charts
- ✅ Price comparison across locations
- ✅ Flexible date range filtering (week, month, year, custom)
- ✅ Spending trends and analysis

## Tech Stack

- **Frontend:** Vue 3 + Vite + Tailwind CSS
- **State Management:** Pinia
- **Database:** Supabase (PostgreSQL)
- **Charts:** Chart.js + vue-chartjs
- **Hosting:** Vercel

## Setup Instructions

### 1. Clone and Install

```bash
cd expense-tracker
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. In the SQL Editor, run the schema setup script (see `supabase-schema.sql`)
4. Get your API credentials from Settings → API → Project URL and anon key
5. Create `.env.local`:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) in Vercel dashboard
4. Deploy!

## Database Schema

The app uses three main tables:

- **locations** - Shopping locations
- **categories** - Expense categories with colors
- **transactions** - Individual expenses linked to locations and categories

See `supabase-schema.sql` for detailed schema.

## API Endpoints

All endpoints are serverless functions in the `api/` folder:

- `POST /api/transactions` - Add transaction
- `GET /api/transactions` - Get all transactions
- `PUT /api/transactions` - Update transaction
- `DELETE /api/transactions` - Delete transaction
- `POST /api/locations` - Add location
- `GET /api/locations` - Get all locations
- `DELETE /api/locations` - Delete location
- `POST /api/categories` - Add category
- `GET /api/categories` - Get all categories
- `DELETE /api/categories` - Delete category

## File Structure

```
expense-tracker/
├── src/
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── stores/          # Pinia store
│   ├── lib/             # Supabase client
│   ├── App.vue
│   ├── router.js
│   └── main.js
├── api/                 # Vercel serverless functions
├── public/
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

## Notes

- The app uses IDR (Indonesian Rupiah) currency by default
- Transactions are stored with their full date and time
- Categories are user-created and customizable
- All data is personal and stored in your Supabase project
