import { getMembers, addMember } from "../../lib/sheets";
import { sendWelcomeEmail } from "../../lib/email";

const MEMBERSHIP_COUPONS = {
  "Individual Membership":          1,
  "Student Membership":             1,
  "Family Membership (2 adults)":   2,
  "Family Membership (3 adults)":   3,
  "Family Membership (4 adults)":   4,
};

function generateCode(existing) {
  let code;
  do { code = Math.floor(10000 + Math.random() * 90000).toString(); }
  while (existing.has(code));
  return code;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { pin, firstName, lastName, email, membershipType, expiryDate, zeffyNumber } = req.body;
  if (pin !== process.env.ADMIN_PIN) return res.status(401).json({ error: "Unauthorized" });
  if (!firstName || !lastName || !email || !membershipType)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const existing = await getMembers();
    const usedCodes = new Set(existing.map(m => m.code));
    const code = generateCode(usedCodes);
    const kmaNumber = "KMA-" + zeffyNumber;
    const couponsIssued = MEMBERSHIP_COUPONS[membershipType] || 1;
    const rowIndex = existing.length + 2;

    await addMember({
      kmaNumber, firstName, lastName, email,
      membershipType, expiryDate, zeffyNumber,
      code, couponsIssued, rowIndex,
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      name: `${firstName} ${lastName}`,
      email, code, kmaNumber, membershipType, couponsIssued,
    }).catch(console.error);

    return res.status(200).json({ success: true, code, kmaNumber, couponsIssued });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
