// Email delivery via Ethereal (fake SMTP for dev/demo — no real credentials needed).
// Swap createTestTransport() for a real provider (SMTP/SendGrid/SES) when ready.
const nodemailer = require("nodemailer");

let transporterPromise = null;

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = nodemailer.createTestAccount().then((testAccount) => {
      console.log(`[mailer] Ethereal test account ready: ${testAccount.user}`);
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    });
  }
  return transporterPromise;
}

async function sendEmail({ to, subject, text }) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: '"Thinkz AI" <no-reply@thinkz.ai>',
    to,
    subject,
    text,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[mailer] Email sent to ${to} — preview: ${previewUrl}`);
  return { messageId: info.messageId, previewUrl };
}

// SMS stub — no phone field on the user model yet, no SMS provider installed.
// Swap this body for Twilio (or similar) once credentials + a phone field exist.
async function sendSMS({ to, text }) {
  console.log(`[sms-stub] Would send SMS to ${to || "(no phone on file)"}: "${text}"`);
  return { simulated: true };
}

module.exports = { sendEmail, sendSMS };