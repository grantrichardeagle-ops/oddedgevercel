// api/odds.js — Vercel Serverless Function
// Proxies requests to The Odds API, adding CORS headers.
// Deployed automatically by Vercel when placed in /api folder.

export default async function handler(req, res) {
  // CORS — allow requests from any origin (your frontend)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { sport, apiKey } = req.query;

  if (!apiKey) return res.status(400).json({ error: 'Missing apiKey' });
  if (!sport)  return res.status(400).json({ error: 'Missing sport' });

  const BOOKS = [
    'draftkings','fanduel','betmgm','caesars',
    'bet365','pinnacle','bovada','williamhill_us',
    'betonlineag','mybookieag'
  ].join(',');

  const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american&bookmakers=${BOOKS}`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();

    // Forward credit headers to the frontend
    const remaining = upstream.headers.get('x-requests-remaining');
    const used      = upstream.headers.get('x-requests-used');
    if (remaining) res.setHeader('x-requests-remaining', remaining);
    if (used)      res.setHeader('x-requests-used', used);

    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
