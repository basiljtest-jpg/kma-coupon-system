import { getRestaurants } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: "PIN required" });
  try {
    const restaurants = await getRestaurants();
    const restaurant = restaurants.find(r => r.pin === pin.trim() && r.active);
    if (!restaurant) return res.status(401).json({ error: "Invalid PIN" });
    const { pin: _, ...safe } = restaurant;
    return res.status(200).json(safe);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
