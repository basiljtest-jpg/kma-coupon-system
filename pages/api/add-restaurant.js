import { getRestaurants, addRestaurant } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { pin, name, ownerName, ownerEmail, restPin } = req.body;
  if (pin !== process.env.ADMIN_PIN) return res.status(401).json({ error: "Unauthorized" });
  if (!name || !ownerEmail || !restPin) return res.status(400).json({ error: "Missing fields" });

  try {
    const existing = await getRestaurants();
    const clash = existing.find(r => r.pin === restPin);
    if (clash) return res.status(400).json({ error: `PIN already used by ${clash.name}` });

    const id = "REST-" + String(existing.length + 1).padStart(3, "0");
    await addRestaurant({ id, name, ownerName, ownerEmail, pin: restPin });
    return res.status(200).json({ success: true, id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
