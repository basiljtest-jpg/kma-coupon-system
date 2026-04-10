import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const KMA_EMAIL = process.env.GMAIL_USER;

export async function sendRedemptionEmails({ member, restaurant, txnId, date, remaining }) {
  const subject = `KMA Coupon Redeemed — ${member.name} at ${restaurant.name}`;

  const body = `
A KMA member coupon was redeemed. Here are the details:

  Member Name:       ${member.name}
  KMA Number:        ${member.kmaNumber}
  Email:             ${member.email}
  Restaurant:        ${restaurant.name}
  Date:              ${date}
  Transaction ID:    ${txnId}

  Coupons Issued:    ${member.couponsIssued}
  Coupons Used:      ${member.couponsUsed}
  Coupons Remaining: ${remaining}

This is an automated email from the KMA Coupon System.

Kamloops Malayali Association
`.trim();

  const recipients = [
    member.email,
    restaurant.ownerEmail,
    KMA_EMAIL,
  ].filter(e => e && e.includes("@"));

  await Promise.allSettled(
    recipients.map(to =>
      transporter.sendMail({
        from: `KMA Coupon System <${KMA_EMAIL}>`,
        to,
        subject,
        text: body,
      })
    )
  );
}

export async function sendWelcomeEmail({ name, email, code, kmaNumber, membershipType, couponsIssued }) {
  await transporter.sendMail({
    from: `KMA Coupon System <${KMA_EMAIL}>`,
    to: email,
    subject: "Welcome to KMA — Your Member Discount Code",
    text: `
Hi ${name},

Welcome to the Kamloops Malayali Association!

Your membership has been registered. Here are your discount coupon details:

  KMA Number:      ${kmaNumber}
  Membership Type: ${membershipType}
  Coupons Issued:  ${couponsIssued}

Your 5-digit discount code is:

  ★  ${code}  ★

Simply share this code with any participating KMA restaurant at billing time to avail your discount.

Keep this email safe — your code is unique to you.

Kamloops Malayali Association
`.trim(),
  });
}
