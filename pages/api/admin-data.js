import { getMembers, getRestaurants, getRedemptions } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { pin } = req.query;
  if (pin !== process.env.ADMIN_PIN) return res.status(401).json({ error: "Unauthorized" });
  try {
    const [members, restaurants, redemptions] = await Promise.all([
      getMembers(), getRestaurants(), getRedemptions(),
    ]);
    return res.status(200).json({ members, restaurants, redemptions });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
