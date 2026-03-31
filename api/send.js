// api/send.js — Vercel Serverless Function
// Proxy μεταξύ browser και ΑΑΔΕ myDATA API (λύνει το CORS)

const ENDPOINTS = {
  test: 'https://mydata-dev.azure-api.net/SendInvoices',
  prod: 'https://mydata.aade.gr/sendInvoices',
};

export default async function handler(req, res) {
  // CORS headers — επιτρέπει requests από το ίδιο Vercel domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, aade-user-id, Ocp-Apim-Subscription-Key, x-env');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const env = req.headers['x-env'] === 'prod' ? 'prod' : 'test';
  const aadeUrl = ENDPOINTS[env];
  const userId = req.headers['aade-user-id'] || '';
  const subKey = req.headers['ocp-apim-subscription-key'] || '';

  if (!userId || !subKey) {
    return res.status(400).json({ error: 'Missing AADE credentials' });
  }

  // Διάβασε το XML body
  let xmlBody = '';
  if (typeof req.body === 'string') {
    xmlBody = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    xmlBody = req.body.toString('utf-8');
  } else {
    // Vercel μερικές φορές κάνει parse αυτόματα — επαναφορά σε string
    xmlBody = JSON.stringify(req.body);
  }

  try {
    const aadeRes = await fetch(aadeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'aade-user-id': userId,
        'Ocp-Apim-Subscription-Key': subKey,
      },
      body: xmlBody,
    });

    const responseText = await aadeRes.text();

    res.status(aadeRes.status)
      .setHeader('Content-Type', 'application/xml')
      .send(responseText);

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}

// Σημαντικό: να μη κάνει parse το body ως JSON
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
