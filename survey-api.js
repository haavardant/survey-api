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

// GET survey
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

// POST survey
app.post('/api/survey/:slug', async (req, res) => {
  const { slug } = req.params;
  const { title, json } = req.body;

  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;

    await pool.query(
      `INSERT INTO surveys (slug, title, json)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE
       SET title = $2, json = $3, updated_at = NOW()`,
      [slug, title, parsed]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving survey:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Survey API running on port ${port}`);
});
