import { getMembers, getRestaurants, incrementCouponsUsed, logRedemption } from "../../lib/sheets";
import { sendRedemptionEmails } from "../../lib/email";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { code, restaurantPin } = req.body;
  if (!code || !restaurantPin) return res.status(400).json({ error: "Missing fields" });

  try {
    const [members, restaurants] = await Promise.all([getMembers(), getRestaurants()]);

    const member = members.find(m => m.code === code.trim());
    if (!member) return res.status(404).json({ error: "Member not found" });

    const restaurant = restaurants.find(r => r.pin === restaurantPin && r.active);
    if (!restaurant) return res.status(403).json({ error: "Invalid restaurant" });

    if (member.couponsRemaining <= 0)
      return res.status(400).json({ error: "No coupons remaining" });

    await incrementCouponsUsed(member.kmaNumber);

    const remaining = member.couponsRemaining - 1;
    const date = new Date().toISOString().slice(0, 10);

    const txnId = await logRedemption({
      kmaNumber:   member.kmaNumber,
      memberName:  member.name,
      memberEmail: member.email,
      restaurant:  restaurant.name,
      remaining,
    });

    // Fire emails — don't await so response is fast
    sendRedemptionEmails({
      member: { ...member, couponsUsed: member.couponsUsed + 1 },
      restaurant,
      txnId,
      date,
      remaining,
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      txnId,
      memberName: member.name,
      kmaNumber:  member.kmaNumber,
      restaurant: restaurant.name,
      used:       member.couponsUsed + 1,
      remaining,
      date,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
