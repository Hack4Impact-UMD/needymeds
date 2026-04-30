import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const region = 'us-east-2';
const client = new SESClient({ region });

const TO_EMAIL = process.env.SURVEY_TO_EMAIL || 'info@needymeds.org';
const FROM_EMAIL = process.env.SES_FROM_EMAIL || '';

export async function sendSurveyEmail(opts: {
  rating: number;
  email: string;
  comments?: string;
  drugName?: string;
}) {
  const subject = `NeedyMeds Survey Feedback${opts.drugName ? ` – ${opts.drugName}` : ''}`;

  const body = [
    `Rating: ${opts.rating} / 5`,
    `From: ${opts.email}`,
    opts.drugName ? `Drug: ${opts.drugName}` : '',
    '',
    opts.comments ? `Comments:\n${opts.comments}` : 'No additional comments.',
  ]
    .filter((line) => line !== undefined)
    .join('\n');

  if (!FROM_EMAIL) {
    // SES not configured — log locally for dev testing
    console.log('[survey] Would send email:');
    console.log(`  To:      ${TO_EMAIL}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${body}`);
    return;
  }

  const cmd = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [TO_EMAIL] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: { Text: { Data: body, Charset: 'UTF-8' } },
    },
    ReplyToAddresses: [opts.email],
  });

  await client.send(cmd);
}
