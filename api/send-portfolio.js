// api/send-portfolio.js — Envoi du portfolio de compétences par email (Resend)
// Variables d'environnement Vercel requises :
//   RESEND_API_KEY   (clé API Resend)
//   PORTFOLIO_FROM   (expéditeur vérifié, ex: "PAC Éminéo <portfolio@emineo.fr>") — optionnel
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.PORTFOLIO_FROM || 'PAC Éminéo <onboarding@resend.dev>';

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { email, studentName, portfolioHTML, bloc, date } = body || {};
    if (!email || !portfolioHTML) {
      return res.status(400).json({ error: 'Missing required fields: email, portfolioHTML' });
    }
    if (!resendKey) {
      // Pas de clé configurée : on ne fait pas échouer l'UX, mais on le signale clairement.
      console.error('RESEND_API_KEY not configured — portfolio not sent');
      return res.status(503).json({ error: 'RESEND_API_KEY not configured', sent: false });
    }

    const subject = `Votre portfolio de compétences PAC${bloc ? ' — ' + bloc : ''}${date ? ' · ' + date : ''}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html: portfolioHTML,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({ error: 'Resend error', detail: data, sent: false });
    }

    return res.status(200).json({ sent: true, id: data.id || null });
  } catch (err) {
    console.error('send-portfolio error:', err);
    return res.status(500).json({ error: 'send-portfolio error', message: err.message, sent: false });
  }
}
