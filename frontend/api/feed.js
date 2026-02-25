export default async function handler(req, res) {
  const apiUrl = process.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
  
  try {
    const response = await fetch(`${apiUrl}/feed`, {
      method: req.method,
      headers: {
        ...req.headers,
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      body: req.method !== 'GET' ? req.body : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
}
