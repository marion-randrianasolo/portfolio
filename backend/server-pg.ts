import http, { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { Pool } from 'pg';

/*
 * API REST en TypeScript pour un portfolio avec stockage PostgreSQL.
 * Les entités gérées sont : projects, experiences, education,
 * languages, skills et personal_info. Les tables sont créées
 * automatiquement au démarrage. Cette version utilise des types
 * explicites afin de faciliter la compréhension du code.
 */

// Création d'un pool de connexions. Les informations de connexion
// proviennent des variables d'environnement (PGHOST, PGUSER, etc.).
const pool = new Pool();

// Création des tables nécessaires si elles n'existent pas
async function initDb(): Promise<void> {
  const queries = [
    `CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      demo_url TEXT,
      github_url TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS experiences (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      category TEXT,
      description TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS education (
      id SERIAL PRIMARY KEY,
      degree TEXT NOT NULL,
      institution TEXT,
      start_year TEXT,
      end_year TEXT,
      description TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS languages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      level TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS personal_info (
      id SERIAL PRIMARY KEY,
      full_name TEXT,
      title TEXT,
      summary TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      photo_url TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS interests (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT
    );`
  ];
  for (const q of queries) {
    await pool.query(q);
  }
}

// Envoi d'une réponse JSON
function sendJson(res: ServerResponse<IncomingMessage>, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function handleRequest(req: IncomingMessage, res: ServerResponse<IncomingMessage>): Promise<void> {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname || '';

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // Endpoint personal_info (enregistrement unique)
    if (pathname === '/api/personal-info') {
      if (req.method === 'GET') {
        const result = await pool.query('SELECT * FROM personal_info ORDER BY id ASC LIMIT 1');
        return sendJson(res, 200, result.rows[0] || {});
      }
      if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const existing = await pool.query('SELECT id FROM personal_info ORDER BY id ASC LIMIT 1');
            let row;
            if (existing.rows.length === 0) {
              const insert = `INSERT INTO personal_info (full_name, title, summary, email, phone, location, photo_url)
                              VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
              const values = [data.fullName || null, data.title || null, data.summary || null, data.email || null, data.phone || null, data.location || null, data.photoUrl || null];
              row = (await pool.query(insert, values)).rows[0];
            } else {
              const id = existing.rows[0].id;
              const update = `UPDATE personal_info SET full_name=$1, title=$2, summary=$3, email=$4, phone=$5, location=$6, photo_url=$7 WHERE id=$8 RETURNING *`;
              const values = [data.fullName || null, data.title || null, data.summary || null, data.email || null, data.phone || null, data.location || null, data.photoUrl || null, id];
              row = (await pool.query(update, values)).rows[0];
            }
            return sendJson(res, 200, row);
          } catch (err: any) {
            return sendJson(res, 400, { error: 'Invalid JSON or database error', details: err.message });
          }
        });
        return;
      }
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    // Gestion générique pour projects, experiences, education, languages, skills, interests
    const match = pathname.match(/^\/api\/(projects|experiences|education|languages|skills|interests)(?:\/(\d+))?$/);
    if (match) {
      const resource = match[1];
      const idPart = match[2];
      const config: Record<string, { table: string; columns: string[]; map: Record<string, string>; }> = {
        projects: { table: 'projects', columns: ['title','description','image_url','demo_url','github_url'], map: { imageUrl: 'image_url', demoUrl: 'demo_url', githubUrl: 'github_url' } },
        experiences: { table: 'experiences', columns: ['title','company','location','start_date','end_date','category','description'], map: { startDate: 'start_date', endDate: 'end_date' } },
        education: { table: 'education', columns: ['degree','institution','start_year','end_year','description'], map: { startYear: 'start_year', endYear: 'end_year' } },
        languages: { table: 'languages', columns: ['name','level'], map: {} },
        skills: { table: 'skills', columns: ['name','category'], map: {} },
        interests: { table: 'interests', columns: ['title','description'], map: {} }
      };
      const cfg = config[resource];

      if (!idPart) {
        // collection routes
        if (req.method === 'GET') {
          const result = await pool.query(`SELECT * FROM ${cfg.table} ORDER BY id ASC`);
          return sendJson(res, 200, result.rows);
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const cols = cfg.columns;
              const values = cols.map(col => {
                const camel = Object.keys(cfg.map).find(k => cfg.map[k] === col) || col;
                return data[camel] !== undefined ? data[camel] : null;
              });
              const placeholders = values.map((_, idx) => `$${idx+1}`).join(', ');
              const query = `INSERT INTO ${cfg.table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
              const result = await pool.query(query, values);
              return sendJson(res, 201, result.rows[0]);
            } catch (err: any) {
              return sendJson(res, 400, { error: 'Invalid JSON or database error', details: err.message });
            }
          });
          return;
        }
        return sendJson(res, 405, { error: 'Method not allowed' });
      }
      // single item
      const id = parseInt(idPart, 10);
      if (isNaN(id)) return sendJson(res, 400, { error: 'Invalid ID' });
      if (req.method === 'GET') {
        const result = await pool.query(`SELECT * FROM ${cfg.table} WHERE id=$1`, [id]);
        return result.rows.length ? sendJson(res, 200, result.rows[0]) : sendJson(res, 404, { error: `${resource.slice(0,-1)} not found` });
      }
      if (req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const cols = cfg.columns;
            const values = cols.map(col => {
              const camel = Object.keys(cfg.map).find(k => cfg.map[k] === col) || col;
              return data[camel] !== undefined ? data[camel] : null;
            });
            values.push(id);
            const assignments = cols.map((col, idx) => `${col}=$${idx+1}`).join(', ');
            const result = await pool.query(`UPDATE ${cfg.table} SET ${assignments} WHERE id=$${cols.length+1} RETURNING *`, values);
            return result.rows.length ? sendJson(res, 200, result.rows[0]) : sendJson(res, 404, { error: `${resource.slice(0,-1)} not found` });
          } catch (err: any) {
            return sendJson(res, 400, { error: 'Invalid JSON or database error', details: err.message });
          }
        });
        return;
      }
      if (req.method === 'DELETE') {
        const result = await pool.query(`DELETE FROM ${cfg.table} WHERE id=$1 RETURNING *`, [id]);
        return result.rows.length ? sendJson(res, 200, { message: `${resource.slice(0,-1)} deleted`, record: result.rows[0] }) : sendJson(res, 404, { error: `${resource.slice(0,-1)} not found` });
      }
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (err: any) {
    return sendJson(res, 500, { error: 'Internal server error', details: err.message });
  }
}

const PORT = process.env.PORT || 4000;
initDb().then(() => {
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch(err => {
      console.error(err);
      sendJson(res, 500, { error: 'Internal server error', details: err.message });
    });
  });
  server.listen(PORT, () => {
    console.log(`PostgreSQL-backed API server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialise database', err);
});