export default async function handler(req, res) {
  const apiUrl = process.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
  
  try {
    // Get the path after /api
    const slug = req.query.slug || [];
    const path = Array.isArray(slug) ? '/' + slug.join('/') : '/' + slug;
    const url = `${apiUrl}${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
    
    console.log(`[API Proxy] ${req.method} ${url}`);

    // Build fetch options
    const fetchOptions = {
      method: req.method,
      headers: {
        ...req.headers,
      },
    };

    // Remove host header
    delete fetchOptions.headers.host;

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      fetchOptions.body = req.body;
    }

    const response = await fetch(url, fetchOptions);
    
    // Read response
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Return response
    if (!response.ok) {
      console.error(`[API Proxy] Error ${response.status}:`, data);
      res.status(response.status);
      if (typeof data === 'string') {
        res.send(data);
      } else {
        res.json(data);
      }
    } else {
      console.log(`[API Proxy] Success`);
      if (typeof data === 'string') {
        res.send(data);
      } else {
        res.json(data);
      }
    }
  } catch (err) {
    console.error('[API Proxy] Error:', err.message);
    res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
}
