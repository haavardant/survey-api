// survey-api.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.get('/api/survey/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query('SELECT title, json FROM surveys WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/survey/:slug', async (req, res) => {
  const { slug } = req.params;
  const { title, pages } = req.body;

  console.log("Received POST /api/survey/:slug");
  console.log("Slug:", slug);
  console.log("Title:", title);
  console.log("Pages:", pages);

  try {
    await pool.query(
      `INSERT INTO surveys (slug, title, json)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE
       SET title = $2, json = $3, updated_at = NOW()`,
      [slug, title, JSON.stringify({ pages })]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving survey:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Optional: fallback handler to catch undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

app.listen(port, () => {
  console.log(`Survey API running on port ${port}`);
});
