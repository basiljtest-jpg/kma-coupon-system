import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

// ── Members ────────────────────────────────────────────────────

export async function getMembers() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Members!A2:L1000",
  });
  const rows = res.data.values || [];
  return rows
    .filter(r => r[0])
    .map(r => ({
      kmaNumber:      r[0]  || "",
      firstName:      r[1]  || "",
      lastName:       r[2]  || "",
      name:           `${r[1] || ""} ${r[2] || ""}`.trim(),
      email:          r[3]  || "",
      membershipType: r[4]  || "",
      expiryDate:     r[5]  || "",
      zeffyNumber:    r[6]  || "",
      code:           r[7]  || "",
      couponsIssued:  parseInt(r[8]  || "0", 10),
      couponsUsed:    parseInt(r[9]  || "0", 10),
      couponsRemaining: parseInt(r[10] || "0", 10),
      status:         r[11] || "Active",
    }));
}

export async function addMember(member) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Members!A:L",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        member.kmaNumber,
        member.firstName,
        member.lastName,
        member.email,
        member.membershipType,
        member.expiryDate || "",
        member.zeffyNumber || "",
        member.code,
        member.couponsIssued,
        0,
        `=I${member.rowIndex}-J${member.rowIndex}`,
        "Active",
      ]],
    },
  });
}

export async function incrementCouponsUsed(kmaNumber) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Members!A2:L1000",
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex(r => r[0] === kmaNumber);
  if (rowIndex === -1) throw new Error("Member not found");
  const sheetRow = rowIndex + 2;
  const currentUsed = parseInt(rows[rowIndex][9] || "0", 10);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Members!J${sheetRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [[currentUsed + 1]] },
  });
  return sheetRow;
}

// ── Restaurants ────────────────────────────────────────────────

export async function getRestaurants() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Restaurants!A2:G100",
  });
  const rows = res.data.values || [];
  return rows
    .filter(r => r[0])
    .map(r => ({
      id:          r[0] || "",
      name:        r[1] || "",
      ownerName:   r[2] || "",
      ownerEmail:  r[3] || "",
      pin:         r[4] || "",
      active:      (r[5] || "").toLowerCase() === "active",
      dateAdded:   r[6] || "",
    }));
}

export async function addRestaurant(restaurant) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Restaurants!A:G",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        restaurant.id,
        restaurant.name,
        restaurant.ownerName || "",
        restaurant.ownerEmail,
        restaurant.pin,
        "Active",
        new Date().toISOString().slice(0, 10),
      ]],
    },
  });
}

// ── Redemptions ────────────────────────────────────────────────

export async function getRedemptions() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Redemptions!A2:J1000",
  });
  const rows = res.data.values || [];
  return rows
    .filter(r => r[0])
    .map(r => ({
      txnId:       r[0] || "",
      date:        r[1] || "",
      time:        r[2] || "",
      kmaNumber:   r[3] || "",
      memberName:  r[4] || "",
      memberEmail: r[5] || "",
      restaurant:  r[6] || "",
      used:        parseInt(r[7] || "1", 10),
      remaining:   parseInt(r[8] || "0", 10),
      notes:       r[9] || "",
    }));
}

export async function logRedemption(data) {
  const sheets = await getSheets();
  const now = new Date();
  const txnId = "TXN-" + Date.now();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Redemptions!A:J",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        txnId,
        now.toISOString().slice(0, 10),
        now.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" }),
        data.kmaNumber,
        data.memberName,
        data.memberEmail,
        data.restaurant,
        1,
        data.remaining,
        "",
      ]],
    },
  });
  return txnId;
}
