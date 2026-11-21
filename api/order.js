// Vercel serverless function: emails you the order + selfie via Resend.
// Env vars (Vercel > Settings > Environment Variables): RESEND_API_KEY, OWNER_EMAIL
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { name, items, total, auraConfirmed, selfie } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!auraConfirmed) return res.status(400).json({ error: 'Confirm your aura and invites first.' });
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Add at least one item.' });
  if (!selfie || !String(selfie).startsWith('data:image/')) return res.status(400).json({ error: 'A selfie is required.' });

  const orderId = Date.now().toString(36).slice(-5).toUpperCase();
  const rows = items.map((i) => `<li>${esc(i.qty)} × ${esc(i.name)}</li>`).join('');
  const html = `<h2>New order #${orderId}: ${esc(name)}</h2><ul>${rows}</ul>
    <p>Total: $${esc(Number(total || 0).toFixed(2))}</p>
    <p><b>Payment:</b> customer was sent to Venmo @amber-le-2103 for $${esc(Number(total || 0).toFixed(2))} with note "Order #${orderId}". Confirm it arrived.</p>
    <p><b>Aura check:</b> customer says they created their aura at comparewithmesf.com and invited 5 people. Verify, then send the $25 gift card.</p>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Orders <onboarding@resend.dev>',
      to: [process.env.OWNER_EMAIL],
      subject: `Order #${orderId} from ${String(name).slice(0, 60)}`,
      html,
      attachments: [{ filename: 'selfie.jpg', content: selfie.split(',')[1] }],
    }),
  });
  if (!r.ok) return res.status(502).json({ error: 'Could not send the order. Try again.' });
  res.json({ ok: true, orderId });
};
