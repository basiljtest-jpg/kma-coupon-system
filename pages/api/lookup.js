import { getMembers } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Code required" });
  try {
    const members = await getMembers();
    const member = members.find(m => m.code === code.trim());
    if (!member) return res.status(404).json({ error: "Member not found" });
    // Never return the raw code or full email to restaurant
    const { code: _, ...safe } = member;
    return res.status(200).json(safe);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
