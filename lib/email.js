import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `KMA Coupon System <${process.env.KMA_EMAIL}>`;
const KMA_EMAIL = process.env.KMA_EMAIL;

export async function sendRedemptionEmails({ member, restaurant, txnId, date, remaining }) {
  const subject = `KMA Coupon Redeemed — ${member.name} at ${restaurant.name}`;

  const body = (recipient) => `
Hi ${recipient},

A KMA member coupon was redeemed. Here are the details:

  Member Name:     ${member.name}
  KMA Number:      ${member.kmaNumber}
  Email:           ${member.email}
  Restaurant:      ${restaurant.name}
  Date:            ${date}
  Transaction ID:  ${txnId}

  Coupons Issued:    ${member.couponsIssued}
  Coupons Used:      ${member.couponsUsed}
  Coupons Remaining: ${remaining}

This is an automated email from the KMA Coupon System.

Kamloops Malayali Association
`.trim();

  const emails = [
    { to: member.email,         text: body("Member") },
    { to: restaurant.ownerEmail, text: body("Restaurant") },
    { to: KMA_EMAIL,            text: body("KMA Admin") },
  ].filter(e => e.to && e.to.includes("@"));

  await Promise.allSettled(
    emails.map(e =>
      resend.emails.send({
        from: FROM,
        to: e.to,
        subject,
        text: e.text,
      })
    )
  );
}

export async function sendWelcomeEmail({ name, email, code, kmaNumber, membershipType, couponsIssued }) {
  await resend.emails.send({
    from: FROM,
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
