import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[mailer] SMTP not configured — missing SMTP_HOST, SMTP_USER or SMTP_PASS');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
}

const STAY_LABELS: Record<string, string> = {
  fri_sat: 'Pátek + sobota',
  fri_only: 'Pouze pátek',
  sat_only: 'Pouze sobota',
  ceremony_only: 'Pouze obřad',
};

export async function sendRsvpNotification(data: {
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  menuPreference: string;
  stayDuration: string;
  children: boolean;
  childrenCount: number;
  allergies: string;
  songRequest: string;
  songNever: string;
}) {
  const transporter = createTransporter();
  if (!transporter) return;

  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;

  const subject = data.attending
    ? `✅ ${data.name} potvrdil/a účast na svatbě`
    : `❌ ${data.name} se nemůže zúčastnit`;

  const rows = data.attending
    ? `
      <tr><td style="padding:6px 12px;color:#7a6e65;font-size:13px">Počet hostů</td><td style="padding:6px 12px;color:#F5F0E8;font-size:13px">${data.guests}</td></tr>
      <tr><td style="padding:6px 12px;color:#7a6e65;font-size:13px">E-mail</td><td style="padding:6px 12px;color:#F5F0E8;font-size:13px">${data.email || '—'}</td></tr>
      <tr><td style="padding:6px 12px;color:#7a6e65;font-size:13px">Preference menu</td><td style="padding:6px 12px;color:#F5F0E8;font-size:13px">${data.menuPreference || '—'}</td></tr>
      <tr><td style="padding:6px 12px;color:#7a6e65;font-size:13px">Délka pobytu</td><td style="padding:6px 12px;color:#F5F0E8;font-size:13px">${STAY_LABELS[data.stayDuration] || data.stayDuration || '—'}</td></tr>
      <tr><td style="padding:6px 12px;color:#7a6e65;font-size:13px">Děti</td><td style="padding:6px 12px;color:#F5F0E8;font-size:13px">${data.children ? `Ano (${data.childrenCount || '?'})` : 'Ne'}</td></tr>
      <tr><td style="padding:6px 12px;color:#7a6e65;font-size:13px">Alergie</td><td style="padding:6px 12px;color:#F5F0E8;font-size:13px">${data.allergies || '—'}</td></tr>
      <tr><td style="padding:6px 12px;color:#7a6e65;font-size:13px">Písnička ✓</td><td style="padding:6px 12px;color:#F5F0E8;font-size:13px">${data.songRequest || '—'}</td></tr>
      <tr><td style="padding:6px 12px;color:#7a6e65;font-size:13px">Písnička ✗</td><td style="padding:6px 12px;color:#F5F0E8;font-size:13px">${data.songNever || '—'}</td></tr>
    `
    : '';

  const html = `
    <div style="background:#0A0A0A;padding:40px 20px;font-family:Georgia,serif;max-width:560px;margin:0 auto">
      <div style="border-top:1px solid #B8A17E33;border-bottom:1px solid #B8A17E33;padding:32px;margin-bottom:24px">
        <p style="color:#B8A17E;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px">Klára & Michal 2026</p>
        <h1 style="color:#F5F0E8;font-size:22px;font-weight:400;margin:0">${subject}</h1>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#111">
          <td style="padding:6px 12px;color:#7a6e65;font-size:13px">Jméno</td>
          <td style="padding:6px 12px;color:#F5F0E8;font-size:13px"><strong>${data.name}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#7a6e65;font-size:13px">Účast</td>
          <td style="padding:6px 12px;font-size:13px;color:${data.attending ? '#34d399' : '#f87171'}">${data.attending ? '✅ Potvrzeno' : '❌ Nepřijede'}</td>
        </tr>
        ${rows}
      </table>
      <p style="color:#5a5248;font-size:11px;margin-top:24px;text-align:center">
        Přehled všech odpovědí: <a href="${process.env.SITE_URL || 'https://alpakyseberou.cz'}/admin" style="color:#B8A17E">administrace</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Svatba K&M" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendTestEmail(): Promise<{ ok: boolean; error?: string; config: Record<string, string> }> {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST || '(nenastaveno)',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_USER: process.env.SMTP_USER || '(nenastaveno)',
    SMTP_PASS: process.env.SMTP_PASS ? '✓ nastaveno' : '(nenastaveno)',
    NOTIFY_EMAIL: process.env.NOTIFY_EMAIL || '(nenastaveno)',
  };

  const transporter = createTransporter();
  if (!transporter) {
    return { ok: false, error: 'SMTP není nakonfigurováno', config };
  }

  const to = process.env.NOTIFY_EMAIL;
  if (!to) {
    return { ok: false, error: 'NOTIFY_EMAIL není nastaveno', config };
  }

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"Svatba K&M" <${process.env.SMTP_USER}>`,
      to,
      subject: '✅ Test emailu — Klára & Michal 2026',
      html: `
        <div style="background:#0A0A0A;padding:40px 20px;font-family:Georgia,serif;max-width:560px;margin:0 auto">
          <div style="border-top:1px solid #B8A17E33;border-bottom:1px solid #B8A17E33;padding:32px">
            <p style="color:#B8A17E;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px">Klára & Michal 2026</p>
            <h1 style="color:#F5F0E8;font-size:22px;font-weight:400;margin:0">Email funguje! 🎉</h1>
            <p style="color:#B8A99A;margin-top:12px">Notifikace ze svatebního webu jsou správně nakonfigurovány.</p>
          </div>
        </div>
      `,
    });
    return { ok: true, config };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message, config };
  }
}

export async function sendGuestbookNotification(data: {
  name: string;
  message: string;
  isPublic: boolean;
  photos: string[];
}) {
  const transporter = createTransporter();
  if (!transporter) return;

  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;

  const subject = `💬 Nový vzkaz na nástěnce od ${data.name}`;

  const photosHtml = data.photos.length > 0
    ? `<p style="color:#7a6e65;font-size:12px;margin-top:16px">📎 Připojeno ${data.photos.length} fotka/fotek</p>`
    : '';

  const html = `
    <div style="background:#0A0A0A;padding:40px 20px;font-family:Georgia,serif;max-width:560px;margin:0 auto">
      <div style="border-top:1px solid #B8A17E33;border-bottom:1px solid #B8A17E33;padding:32px;margin-bottom:24px">
        <p style="color:#B8A17E;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px">Klára & Michal 2026</p>
        <h1 style="color:#F5F0E8;font-size:22px;font-weight:400;margin:0">${subject}</h1>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#111">
          <td style="padding:6px 12px;color:#7a6e65;font-size:13px">Jméno</td>
          <td style="padding:6px 12px;color:#F5F0E8;font-size:13px"><strong>${data.name}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#7a6e65;font-size:13px">Viditelnost</td>
          <td style="padding:6px 12px;font-size:13px;color:${data.isPublic ? '#34d399' : '#fbbf24'}">${data.isPublic ? '👁 Veřejný' : '🔒 Soukromý'}</td>
        </tr>
      </table>
      <div style="margin-top:20px;padding:20px;border:1px solid #2A2520;border-radius:2px">
        <p style="color:#B8A99A;font-size:15px;line-height:1.6;margin:0">${data.message.replace(/\n/g, '<br>')}</p>
        ${photosHtml}
      </div>
      <p style="color:#5a5248;font-size:11px;margin-top:24px;text-align:center">
        Přehled nástěnky: <a href="${process.env.SITE_URL || 'https://alpakyseberou.cz'}/admin" style="color:#B8A17E">administrace</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Svatba K&M" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
