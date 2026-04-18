import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM_EMAIL = 'TeeForGood <noreply@teeforgood.com>'

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  signup: (name: string) => ({
    subject: 'Welcome to TeeForGood!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00ff88;">Welcome to TeeForGood, ${name}!</h1>
        <p>Your golf journey to making a difference starts now.</p>
        <p>Track your scores, enter draws, and support charities with every swing.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #00ff88, #00ffff); color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
          Go to Dashboard
        </a>
      </div>
    `,
  }),

  subscriptionSuccess: (name: string, plan: string) => ({
    subject: 'Subscription Confirmed!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ffd700;">You're all set, ${name}!</h1>
        <p>Your ${plan} subscription is now active.</p>
        <p>You can now:</p>
        <ul>
          <li>Track unlimited golf scores</li>
          <li>Enter all monthly draws</li>
          <li>Choose your charity and contribution percentage</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #ffd700, #ff8800); color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
          Start Tracking Scores
        </a>
      </div>
    `,
  }),

  drawResults: (name: string, matches: number, won: boolean, amount?: string) => ({
    subject: won ? '🎉 You Won!' : 'Monthly Draw Results',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${won ? '#ffd700' : '#00ffff'};">
          ${won ? '🎉 Congratulations!' : 'Draw Results'}
        </h1>
        <p>Hi ${name},</p>
        <p>The monthly draw has concluded and you matched ${matches} numbers!</p>
        ${won ? `<p style="font-size: 24px; color: #ffd700; font-weight: bold;">You won ${amount}!</p>` : '<p>Keep playing and entering for next month!</p>'}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/draws" 
           style="display: inline-block; background: linear-gradient(135deg, #00ffff, #0088ff); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
          View Full Results
        </a>
      </div>
    `,
  }),

  winnerNotification: (name: string, amount: string, drawDate: string) => ({
    subject: '🏆 Winner! Claim Your Prize',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ffd700;">🏆 You're a Winner!</h1>
        <p>Congratulations ${name}!</p>
        <p style="font-size: 28px; color: #ffd700; font-weight: bold;">${amount}</p>
        <p>Draw date: ${drawDate}</p>
        <p>Please upload your proof of identity to claim your prize within 30 days.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" 
           style="display: inline-block; background: linear-gradient(135deg, #ffd700, #ff8800); color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
          Claim Prize
        </a>
      </div>
    `,
  }),
}

export const sendEmailByTemplate = async (
  to: string,
  template: keyof typeof emailTemplates,
  ...args: Parameters<typeof emailTemplates[keyof typeof emailTemplates]>
) => {
  const templateFn = emailTemplates[template] as (...args: any[]) => { subject: string; html: string }
  const { subject, html } = templateFn(...args)
  await sendEmail({ to, subject, html })
}
