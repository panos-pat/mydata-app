// api/send.js — Vercel Serverless Function
// Χρησιμοποιεί το built-in https module αντί για fetch (Vercel compatibility)

const https = require('https');

const ENDPOINTS = {
  test: { host: 'mydataapidev.aade.gr', path: '/SendInvoices' },
  prod: { host: 'mydata.aade.gr',       path: '/SendInvoices' },
};

function httpsPost({ host, path, headers, body }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: host, path, method: 'POST', headers },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, aade-user-id, Ocp-Apim-Subscription-Key, x-env');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const env = req.headers['x-env'] === 'prod' ? 'prod' : 'test';
  const endpoint = ENDPOINTS[env];
  const userId = req.headers['aade-user-id'] || '';
  const subKey = req.headers['ocp-apim-subscription-key'] || '';

  if (!userId || !subKey) return res.status(400).end('Missing credentials');

  // Διάβασε body
  const body = await new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
  });

  try {
    const result = await httpsPost({
      host: endpoint.host,
      path: endpoint.path,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Length': Buffer.byteLength(body),
        'aade-user-id': userId,
        'Ocp-Apim-Subscription-Key': subKey,
      },
      body,
    });

    res.status(result.status)
       .setHeader('Content-Type', 'application/xml')
       .send(result.body);

  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).send('Proxy error: ' + err.message);
  }
};
