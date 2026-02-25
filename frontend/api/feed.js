export default async function handler(req, res) {
  const apiUrl = process.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
  
  try {
    // Parse incoming request
    const path = req.url.replace('/api/feed', '');
    const url = `${apiUrl}/feed${path}`;
    
    console.log(`[Proxy] ${req.method} ${url}`);

    // Build fetch options
    const fetchOptions = {
      method: req.method,
      headers: {
        ...req.headers,
      },
    };

    // Remove host header to avoid conflicts
    delete fetchOptions.headers.host;

    // Only add body for methods that support it
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = req.body;
    }

    console.log(`[Proxy] Headers:`, JSON.stringify(fetchOptions.headers));

    const response = await fetch(url, fetchOptions);
    
    // Check if response is ok
    if (!response.ok) {
      console.error(`[Proxy] Backend returned ${response.status}`);
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    // Get response data
    const data = await response.json();
    
    console.log(`[Proxy] Success:`, data ? 'data returned' : 'null');
    
    // Return to frontend
    res.status(200).json(data);
  } catch (err) {
    console.error('[Proxy] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
