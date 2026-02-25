
const { default: fetch } = require('node-fetch');

async function getNewUsers(timestamp) {
  const url = `https://sigo-com-fe-api.onrender.com/api/openclaw/users/new?since=${timestamp}`;
  const token = 'sigocomfe2026';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching new users:', error);
    console.log(JSON.stringify({ error: error.message }));
  }
}

getNewUsers(process.argv[2]);
